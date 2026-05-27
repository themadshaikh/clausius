import type { UnitSystem } from './types';

export const CRITICAL_POINT = {
  T: 374.14,
  P: 22.089,
  rho: 317.0,
};

export const TRIPLE_POINT = {
  T: 0.01,
  P: 0.000612,
};

export const CRITICAL_PROXIMITY = {
  dT: 10,
  dP: 2.0,
};

export const siToImperial = {
  T: (c: number) => c * 9 / 5 + 32,
  P: (mpa: number) => mpa * 145.038,
  h: (kjkg: number) => kjkg * 0.429923,
  s: (kjkgk: number) => kjkgk * 0.238846,
  v: (m3kg: number) => m3kg * 16.0185,
  u: (kjkg: number) => kjkg * 0.429923,
};

export const imperialToSI = {
  T: (f: number) => (f - 32) * 5 / 9,
  P: (psia: number) => psia / 145.038,
  h: (btulbm: number) => btulbm / 0.429923,
  s: (btulbmr: number) => btulbmr / 0.238846,
  v: (ft3lbm: number) => ft3lbm / 16.0185,
  u: (btulbm: number) => btulbm / 0.429923,
};

export const unitLabels: Record<UnitSystem, Record<string, string>> = {
  SI: {
    T: '°C',
    P: 'MPa',
    h: 'kJ/kg',
    s: 'kJ/(kg·K)',
    v: 'm³/kg',
    u: 'kJ/kg',
    hf: 'kJ/kg',
    hfg: 'kJ/kg',
    hg: 'kJ/kg',
    sf: 'kJ/(kg·K)',
    sfg: 'kJ/(kg·K)',
    sg: 'kJ/(kg·K)',
    vf: 'm³/kg',
    vg: 'm³/kg',
    uf: 'kJ/kg',
    ufg: 'kJ/kg',
    ug: 'kJ/kg',
  },
  IMPERIAL: {
    T: '°F',
    P: 'psia',
    h: 'BTU/lbm',
    s: 'BTU/(lbm·°R)',
    v: 'ft³/lbm',
    u: 'BTU/lbm',
    hf: 'BTU/lbm',
    hfg: 'BTU/lbm',
    hg: 'BTU/lbm',
    sf: 'BTU/(lbm·°R)',
    sfg: 'BTU/(lbm·°R)',
    sg: 'BTU/(lbm·°R)',
    vf: 'ft³/lbm',
    vg: 'ft³/lbm',
    uf: 'BTU/lbm',
    ufg: 'BTU/lbm',
    ug: 'BTU/lbm',
  },
};

export function convertPropertyToDisplay(
  prop: string,
  value: number,
  unitSystem: UnitSystem
): number {
  if (unitSystem === 'SI') return value;
  switch (prop) {
    case 'T': return siToImperial.T(value);
    case 'P': return siToImperial.P(value);
    case 'h': case 'hf': case 'hfg': case 'hg':
    case 'uf': case 'ufg': case 'ug': case 'u':
      return siToImperial.h(value);
    case 's': case 'sf': case 'sfg': case 'sg':
      return siToImperial.s(value);
    case 'v': case 'vf': case 'vg':
      return siToImperial.v(value);
    default: return value;
  }
}

export function convertInputToSI(
  prop: string,
  value: number,
  unitSystem: UnitSystem
): number {
  if (unitSystem === 'SI') return value;
  switch (prop) {
    case 'T': return imperialToSI.T(value);
    case 'P': return imperialToSI.P(value);
    default: return value;
  }
}

export function formatValue(value: number, sigFigs = 6): string {
  if (value === 0) return '0';
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  if (magnitude >= 4 || magnitude < -2) {
    return value.toExponential(sigFigs - 1);
  }
  const decimalPlaces = Math.max(0, sigFigs - 1 - magnitude);
  return value.toFixed(decimalPlaces);
}
