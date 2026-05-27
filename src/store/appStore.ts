import { create } from 'zustand';
import type {
  Standard,
  UnitSystem,
  TableType,
  InterpolationResult,
  LookupResult,
  Region,
} from '../engine/types';
import { OutOfBoundsError } from '../engine/types';
import { getTable } from '../data/index';
import { detectRegion, getSatPressureAtT, getSatTempAtP } from '../engine/regions';
import {
  interpolateSatRow,
  interpolateSuperheated,
  qualityInterpolation,
} from '../engine/interpolation';
import { exactLookup } from '../engine/lookup';
import type { SteamProperties, SuperheatedPressureSlice } from '../engine/types';

interface AppState {
  standard: Standard;
  unitSystem: UnitSystem;
  mode: 'INTERPOLATION' | 'TABLE_LOOKUP';

  // Interpolation mode
  tableType: TableType;
  inputs: { T?: number; P?: number; x?: number };
  result: InterpolationResult | null;
  isCalculating: boolean;
  error: string | null;

  // Table lookup mode
  lookupTableType: TableType;
  lookupIndex: number | null;
  lookupIndexProp: 'T' | 'P';
  lookupResult: LookupResult | null;
  showFullTable: boolean;

  // Detected region (live)
  detectedRegion: Region | null;

  // Actions
  setStandard: (s: Standard) => void;
  setUnitSystem: (u: UnitSystem) => void;
  setMode: (m: 'INTERPOLATION' | 'TABLE_LOOKUP') => void;
  setTableType: (t: TableType) => void;
  setInput: (key: 'T' | 'P' | 'x', value: number | undefined) => void;
  setLookupTableType: (t: TableType) => void;
  setLookupIndex: (v: number | null) => void;
  setLookupIndexProp: (p: 'T' | 'P') => void;
  setShowFullTable: (v: boolean) => void;
  calculate: () => void;
  lookup: () => void;
  clearResult: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  standard: 'IAPWS-IF97',
  unitSystem: 'SI',
  mode: 'INTERPOLATION',
  tableType: 'SATURATED_TEMPERATURE',
  inputs: {},
  result: null,
  isCalculating: false,
  error: null,
  lookupTableType: 'SATURATED_TEMPERATURE',
  lookupIndex: null,
  lookupIndexProp: 'T',
  lookupResult: null,
  showFullTable: false,
  detectedRegion: null,

  setStandard: (s) => set({ standard: s, result: null, lookupResult: null, error: null }),
  setUnitSystem: (u) => set({ unitSystem: u }),
  setMode: (m) => set({ mode: m, result: null, lookupResult: null, error: null }),
  setTableType: (t) => set({ tableType: t, result: null, error: null, inputs: {} }),
  setLookupTableType: (t) => set({ lookupTableType: t, lookupResult: null }),
  setLookupIndex: (v) => set({ lookupIndex: v }),
  setLookupIndexProp: (p) => set({ lookupIndexProp: p }),
  setShowFullTable: (v) => set({ showFullTable: v }),

  setInput: (key, value) => {
    const state = get();
    const newInputs = { ...state.inputs, [key]: value };
    // Live region detection for T+P inputs
    let detectedRegion: Region | null = null;
    if (newInputs.T !== undefined && newInputs.P !== undefined) {
      try {
        detectedRegion = detectRegion(newInputs.T, newInputs.P, state.standard);
      } catch { /* silent */ }
    } else if (newInputs.T !== undefined && state.tableType === 'SATURATED_TEMPERATURE') {
      detectedRegion = 'SATURATED';
    } else if (newInputs.P !== undefined && state.tableType === 'SATURATED_PRESSURE') {
      detectedRegion = 'SATURATED';
    }
    set({ inputs: newInputs, detectedRegion, result: null, error: null });
  },

  clearResult: () => set({ result: null, error: null, lookupResult: null }),

  calculate: () => {
    const state = get();
    const { standard, tableType, inputs, unitSystem } = state;
    set({ isCalculating: true, error: null, result: null });

    try {
      const warnings: string[] = [];

      if (tableType === 'SATURATED_TEMPERATURE') {
        const T = inputs.T;
        if (T === undefined) throw new Error('Temperature input is required.');
        const table = getTable(standard, 'SATURATED_TEMPERATURE') as SteamProperties[];

        const minT = table[0].T;
        const maxT = table[table.length - 1].T;

        if (T < minT || T > maxT) {
          throw new OutOfBoundsError(
            `Input out of table bounds — extrapolation beyond this range is not ` +
            `thermodynamically validated.\nTable range: ${minT}°C to ${maxT}°C.\nYour input: ${T}°C.`
          );
        }

        // Find exact or bounding rows
        let exactRow: SteamProperties | undefined;
        for (const row of table) {
          if (Math.abs(row.T - T) < 1e-6) { exactRow = row; break; }
        }

        if (exactRow) {
          if (inputs.x !== undefined) {
            const { result, work } = qualityInterpolation(exactRow, inputs.x);
            set({
              isCalculating: false,
              result: {
                properties: result,
                region: 'SATURATED',
                interpolationType: 'QUALITY_BASED',
                workShown: work,
                standard,
                unitSystem,
                warnings,
              },
            });
          } else {
            set({
              isCalculating: false,
              result: {
                properties: exactRow,
                region: 'SATURATED',
                interpolationType: 'EXACT',
                workShown: {
                  lowerBound: { index: exactRow.T, values: exactRow as unknown as Partial<Record<string, number>> },
                  upperBound: { index: exactRow.T, values: exactRow as unknown as Partial<Record<string, number>> },
                  fraction: 0,
                  formula: `Exact tabulated value at T = ${T}°C`,
                },
                standard,
                unitSystem,
                warnings,
              },
            });
          }
          return;
        }

        // Linear interpolation
        let lo = -1, hi = -1;
        for (let i = 0; i < table.length - 1; i++) {
          if (table[i].T <= T && table[i + 1].T >= T) { lo = i; hi = i + 1; break; }
        }
        if (lo < 0) throw new Error('Could not find bounding rows in table.');

        if (table[lo].nearCriticalPoint || table[hi].nearCriticalPoint) {
          warnings.push('One or both bounding points are near the critical point. Property gradients are extremely steep — interpolated values should be used with caution.');
        }

        const { result, fraction, work } = interpolateSatRow(T, table[lo], table[hi], 'T');

        if (inputs.x !== undefined) {
          const satRow = result as SteamProperties;
          const { result: qResult, work: qWork } = qualityInterpolation(satRow, inputs.x);
          set({
            isCalculating: false,
            result: {
              properties: qResult,
              region: 'SATURATED',
              interpolationType: 'QUALITY_BASED',
              workShown: qWork,
              standard,
              unitSystem,
              warnings,
            },
          });
        } else {
          set({
            isCalculating: false,
            result: {
              properties: result as Partial<SteamProperties>,
              region: 'SATURATED',
              interpolationType: fraction === 0 ? 'EXACT' : 'LINEAR',
              workShown: work,
              standard,
              unitSystem,
              warnings,
            },
          });
        }

      } else if (tableType === 'SATURATED_PRESSURE') {
        const P = inputs.P;
        if (P === undefined) throw new Error('Pressure input is required.');
        const table = getTable(standard, 'SATURATED_PRESSURE') as SteamProperties[];

        const minP = table[0].P;
        const maxP = table[table.length - 1].P;

        if (P < minP || P > maxP) {
          throw new OutOfBoundsError(
            `Input out of table bounds.\nTable range: ${minP} to ${maxP} MPa.\nYour input: ${P} MPa.`
          );
        }

        let exactRow: SteamProperties | undefined;
        for (const row of table) {
          if (Math.abs(row.P - P) < 1e-9) { exactRow = row; break; }
        }

        if (exactRow) {
          if (inputs.x !== undefined) {
            const { result, work } = qualityInterpolation(exactRow, inputs.x);
            set({
              isCalculating: false,
              result: {
                properties: result,
                region: 'SATURATED',
                interpolationType: 'QUALITY_BASED',
                workShown: work,
                standard, unitSystem, warnings,
              },
            });
          } else {
            set({
              isCalculating: false,
              result: {
                properties: exactRow,
                region: 'SATURATED',
                interpolationType: 'EXACT',
                workShown: {
                  lowerBound: { index: exactRow.P, values: exactRow as unknown as Partial<Record<string, number>> },
                  upperBound: { index: exactRow.P, values: exactRow as unknown as Partial<Record<string, number>> },
                  fraction: 0,
                  formula: `Exact tabulated value at P = ${P} MPa`,
                },
                standard, unitSystem, warnings,
              },
            });
          }
          return;
        }

        let lo = -1, hi = -1;
        for (let i = 0; i < table.length - 1; i++) {
          if (table[i].P <= P && table[i + 1].P >= P) { lo = i; hi = i + 1; break; }
        }
        if (lo < 0) throw new Error('Could not find bounding rows.');

        if (table[lo].nearCriticalPoint || table[hi].nearCriticalPoint) {
          warnings.push('Near critical point — property gradients are steep. Use with caution.');
        }

        const { result, fraction, work } = interpolateSatRow(P, table[lo], table[hi], 'P');

        if (inputs.x !== undefined) {
          const satRow = result as SteamProperties;
          const { result: qResult, work: qWork } = qualityInterpolation(satRow, inputs.x);
          set({
            isCalculating: false,
            result: {
              properties: qResult,
              region: 'SATURATED',
              interpolationType: 'QUALITY_BASED',
              workShown: qWork,
              standard, unitSystem, warnings,
            },
          });
        } else {
          set({
            isCalculating: false,
            result: {
              properties: result as Partial<SteamProperties>,
              region: 'SATURATED',
              interpolationType: fraction === 0 ? 'EXACT' : 'LINEAR',
              workShown: work,
              standard, unitSystem, warnings,
            },
          });
        }

      } else if (tableType === 'SUPERHEATED') {
        const T = inputs.T;
        const P = inputs.P;
        if (T === undefined || P === undefined) {
          throw new Error('Both temperature and pressure are required for superheated steam.');
        }

        const slices = getTable(standard, 'SUPERHEATED') as SuperheatedPressureSlice[];
        const minP = slices[0].P;
        const maxP = slices[slices.length - 1].P;
        const minT = slices[0].points[0].T;

        if (P < minP || P > maxP) {
          throw new OutOfBoundsError(
            `Pressure out of superheated table bounds.\nRange: ${minP}–${maxP} MPa.\nYour input: ${P} MPa.`
          );
        }

        // Find Tsat at given P to validate T > Tsat
        const Tsat = getSatTempAtP(P, standard);
        if (Tsat !== null && T <= Tsat) {
          warnings.push(`T = ${T}°C is not above saturation temperature (Tsat ≈ ${Tsat.toFixed(2)}°C) at P = ${P} MPa. Check that state is actually superheated.`);
        }

        if (T > 1300) {
          throw new OutOfBoundsError(
            `Temperature out of superheated table bounds.\nRange: ${minT}–1300°C.\nYour input: ${T}°C.`
          );
        }

        // Find bounding pressure slices
        let loSlice = -1, hiSlice = -1;
        for (let i = 0; i < slices.length - 1; i++) {
          if (slices[i].P <= P && slices[i + 1].P >= P) {
            loSlice = i; hiSlice = i + 1; break;
          }
        }

        if (loSlice < 0) {
          // Exact pressure match
          const exactSlice = slices.find(s => Math.abs(s.P - P) < 1e-9);
          if (!exactSlice) throw new Error('Could not find pressure slice.');

          const points = exactSlice.points;
          let loT = -1, hiT = -1;
          for (let i = 0; i < points.length - 1; i++) {
            if (points[i].T <= T && points[i + 1].T >= T) { loT = i; hiT = i + 1; break; }
          }

          let props;
          if (loT < 0) {
            props = points.find(p => Math.abs(p.T - T) < 1e-6) || points[0];
          } else {
            const frac = (T - points[loT].T) / (points[hiT].T - points[loT].T);
            props = {
              T,
              h: points[loT].h + frac * (points[hiT].h - points[loT].h),
              s: points[loT].s + frac * (points[hiT].s - points[loT].s),
              v: points[loT].v + frac * (points[hiT].v - points[loT].v),
              u: points[loT].u + frac * (points[hiT].u - points[loT].u),
            };
          }

          set({
            isCalculating: false,
            result: {
              properties: props,
              region: 'SUPERHEATED',
              interpolationType: 'LINEAR',
              workShown: {
                lowerBound: { index: loT >= 0 ? points[loT].T : T, values: loT >= 0 ? points[loT] as unknown as Partial<Record<string, number>> : {} },
                upperBound: { index: hiT >= 0 ? points[hiT].T : T, values: hiT >= 0 ? points[hiT] as unknown as Partial<Record<string, number>> : {} },
                fraction: loT >= 0 ? (T - points[loT].T) / (points[hiT].T - points[loT].T) : 0,
                formula: `Linear interpolation in temperature at P = ${P} MPa`,
              },
              standard, unitSystem, warnings,
            },
          });
          return;
        }

        const { result, work } = interpolateSuperheated(P, T, slices[loSlice], slices[hiSlice]);

        set({
          isCalculating: false,
          result: {
            properties: result,
            region: 'SUPERHEATED',
            interpolationType: 'BILINEAR',
            workShown: work,
            standard, unitSystem, warnings,
          },
        });

      } else if (tableType === 'COMPRESSED_LIQUID') {
        const T = inputs.T;
        const P = inputs.P;
        if (T === undefined || P === undefined) {
          throw new Error('Both temperature and pressure are required for compressed liquid.');
        }

        // Approximation: use saturated liquid properties at given T plus correction
        const Psat = getSatPressureAtT(T, standard);
        if (Psat !== null && P < Psat) {
          warnings.push('Pressure is below saturation pressure at this temperature — state may not be compressed liquid.');
        }

        // For compressed liquid, use subcooled approximation: h ≈ hf(T), s ≈ sf(T)
        const satTable = getTable(standard, 'SATURATED_TEMPERATURE') as SteamProperties[];
        let lo = -1, hi = -1;
        for (let i = 0; i < satTable.length - 1; i++) {
          if (satTable[i].T <= T && satTable[i + 1].T >= T) { lo = i; hi = i + 1; break; }
        }

        if (lo < 0) {
          throw new OutOfBoundsError(`Temperature ${T}°C out of saturated table bounds for compressed liquid approximation.`);
        }

        const { result } = interpolateSatRow(T, satTable[lo], satTable[hi], 'T');
        warnings.push('Compressed liquid properties approximated as saturated liquid at given T with slight pressure correction. For precise values, use the dedicated compressed liquid table.');

        set({
          isCalculating: false,
          result: {
            properties: {
              T: result.T,
              P,
              hf: result.hf,
              sf: result.sf,
              vf: result.vf,
              uf: result.uf,
            },
            region: 'SUBCOOLED',
            interpolationType: 'LINEAR',
            workShown: {
              lowerBound: { index: satTable[lo].T, values: satTable[lo] as unknown as Partial<Record<string, number>> },
              upperBound: { index: satTable[hi].T, values: satTable[hi] as unknown as Partial<Record<string, number>> },
              fraction: (T - satTable[lo].T) / (satTable[hi].T - satTable[lo].T),
              formula: `Compressed liquid approximation: h ≈ hf(T), s ≈ sf(T) at T = ${T}°C`,
            },
            standard, unitSystem, warnings,
          },
        });
      }
    } catch (err) {
      set({
        isCalculating: false,
        error: err instanceof Error ? err.message : 'An unknown error occurred.',
        result: null,
      });
    }
  },

  lookup: () => {
    const { lookupTableType, lookupIndex, standard } = get();
    if (lookupIndex === null) {
      set({ error: 'Please enter a value to look up.' });
      return;
    }
    set({ error: null, lookupResult: null });
    try {
      const result = exactLookup(lookupIndex, lookupTableType, standard);
      set({ lookupResult: result });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Lookup error.' });
    }
  },
}));
