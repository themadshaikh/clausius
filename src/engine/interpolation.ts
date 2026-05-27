import type {
  SteamProperties,
  SuperheatedPoint,
  SuperheatedPressureSlice,
  BilinearStep,
  InterpolationWork,
} from './types';
import { OutOfBoundsError } from './types';

export function linearInterpolate(
  x: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number
): { result: number; fraction: number; formula: string } {
  const fraction = (x - x1) / (x2 - x1);
  const result = y1 + fraction * (y2 - y1);
  const formula = `y = ${y1} + [(${x} − ${x1}) / (${x2} − ${x1})] × (${y2} − ${y1})`;
  return { result, fraction, formula };
}

export function interpolateSatRow(
  targetIndex: number,
  lowerRow: SteamProperties,
  upperRow: SteamProperties,
  indexProp: 'T' | 'P'
): {
  result: Partial<SteamProperties>;
  fraction: number;
  work: InterpolationWork;
} {
  const x1 = lowerRow[indexProp];
  const x2 = upperRow[indexProp];
  const fraction = (targetIndex - x1) / (x2 - x1);

  const props: Array<keyof SteamProperties> = [
    'T', 'P', 'hf', 'hfg', 'hg', 'sf', 'sfg', 'sg', 'vf', 'vg', 'uf', 'ufg', 'ug',
  ];

  const result: Partial<SteamProperties> = {};
  for (const prop of props) {
    const y1 = lowerRow[prop] as number;
    const y2 = upperRow[prop] as number;
    (result as Record<string, number>)[prop] = y1 + fraction * (y2 - y1);
  }

  const hFormula = `h_f = ${lowerRow.hf} + [(${targetIndex} − ${x1}) / (${x2} − ${x1})] × (${upperRow.hf} − ${lowerRow.hf}) = ${result.hf?.toFixed(4)}`;

  const work: InterpolationWork = {
    lowerBound: { index: x1, values: lowerRow as unknown as Partial<Record<string, number>> },
    upperBound: { index: x2, values: upperRow as unknown as Partial<Record<string, number>> },
    fraction,
    formula: hFormula,
  };

  return { result, fraction, work };
}

export function interpolateSuperheated(
  targetP: number,
  targetT: number,
  lowerPSlice: SuperheatedPressureSlice,
  upperPSlice: SuperheatedPressureSlice
): {
  result: SuperheatedPoint;
  work: InterpolationWork;
} {
  const steps: BilinearStep[] = [];

  const props: Array<keyof SuperheatedPoint> = ['h', 's', 'v', 'u'];

  function interpolateAtSlice(
    slice: SuperheatedPressureSlice,
    T: number
  ): Partial<SuperheatedPoint> {
    const points = slice.points;
    let lo = -1;
    let hi = -1;
    for (let i = 0; i < points.length - 1; i++) {
      if (points[i].T <= T && points[i + 1].T >= T) {
        lo = i;
        hi = i + 1;
        break;
      }
    }
    if (lo < 0) {
      if (T <= points[0].T) return points[0];
      return points[points.length - 1];
    }
    const T1 = points[lo].T;
    const T2 = points[hi].T;
    const frac = (T - T1) / (T2 - T1);
    const out: Partial<SuperheatedPoint> = { T };
    for (const prop of props) {
      const y1 = points[lo][prop] as number;
      const y2 = points[hi][prop] as number;
      (out as Record<string, number>)[prop] = y1 + frac * (y2 - y1);
    }
    return out;
  }

  const r1 = interpolateAtSlice(lowerPSlice, targetT);
  const r2 = interpolateAtSlice(upperPSlice, targetT);

  const P1 = lowerPSlice.P;
  const P2 = upperPSlice.P;
  const pFrac = (targetP - P1) / (P2 - P1);

  const result: SuperheatedPoint = { T: targetT, h: 0, s: 0, v: 0, u: 0 };

  for (const prop of props) {
    const y1 = r1[prop] as number;
    const y2 = r2[prop] as number;
    const finalVal = y1 + pFrac * (y2 - y1);
    result[prop] = finalVal;

    steps.push({
      description: `Interpolate ${prop} at P₁=${P1} MPa, T=${targetT}°C → R₁ = ${y1.toFixed(4)}`,
      lowerBound: y1,
      upperBound: y2,
      fraction: pFrac,
      result: finalVal,
      property: prop,
    });
  }

  const work: InterpolationWork = {
    lowerBound: { index: P1, values: { P: P1, h: r1.h ?? 0 } },
    upperBound: { index: P2, values: { P: P2, h: r2.h ?? 0 } },
    fraction: pFrac,
    formula: `Bilinear interpolation: Step 1 — interpolate across T at P₁=${P1} MPa and P₂=${P2} MPa; Step 2 — interpolate R₁ and R₂ across pressure`,
    intermediateSteps: steps,
  };

  return { result, work };
}

export function qualityInterpolation(
  satRow: SteamProperties,
  quality: number
): {
  result: Partial<SteamProperties & SuperheatedPoint>;
  work: InterpolationWork;
} {
  if (quality < 0 || quality > 1) {
    throw new OutOfBoundsError(
      `Steam quality x must be between 0 and 1. Received: ${quality}`
    );
  }

  const h = satRow.hf + quality * satRow.hfg;
  const s = satRow.sf + quality * satRow.sfg;
  const v = satRow.vf + quality * (satRow.vg - satRow.vf);
  const u = satRow.uf + quality * satRow.ufg;

  const result: Partial<SteamProperties & SuperheatedPoint> = {
    T: satRow.T,
    P: satRow.P,
    h,
    s,
    v,
    u,
  };

  const formula =
    `h = h_f + x·h_fg = ${satRow.hf} + ${quality}×${satRow.hfg} = ${h.toFixed(4)} kJ/kg\n` +
    `s = s_f + x·s_fg = ${satRow.sf} + ${quality}×${satRow.sfg} = ${s.toFixed(6)} kJ/(kg·K)\n` +
    `v = v_f + x·(v_g − v_f) = ${satRow.vf} + ${quality}×(${satRow.vg} − ${satRow.vf}) = ${v.toFixed(6)} m³/kg\n` +
    `u = u_f + x·u_fg = ${satRow.uf} + ${quality}×${satRow.ufg} = ${u.toFixed(4)} kJ/kg`;

  const work: InterpolationWork = {
    lowerBound: { index: 'x=0 (saturated liquid)', values: satRow as unknown as Partial<Record<string, number>> },
    upperBound: { index: 'x=1 (saturated vapor)', values: satRow as unknown as Partial<Record<string, number>> },
    fraction: quality,
    formula,
  };

  return { result, work };
}
