import type { Standard, Region } from './types';
import { CRITICAL_POINT } from './units';
import { getTable } from '../data/index';

export function getSatPressureAtT(T: number, standard: Standard): number | null {
  const table = getTable(standard, 'SATURATED_TEMPERATURE') as Array<{ T: number; P: number }>;
  if (!table || table.length === 0) return null;

  if (T <= table[0].T) return table[0].P;
  if (T >= table[table.length - 1].T) return table[table.length - 1].P;

  for (let i = 0; i < table.length - 1; i++) {
    if (table[i].T <= T && table[i + 1].T >= T) {
      const frac = (T - table[i].T) / (table[i + 1].T - table[i].T);
      return table[i].P + frac * (table[i + 1].P - table[i].P);
    }
  }
  return null;
}

export function getSatTempAtP(P: number, standard: Standard): number | null {
  const table = getTable(standard, 'SATURATED_PRESSURE') as Array<{ T: number; P: number }>;
  if (!table || table.length === 0) return null;

  if (P <= table[0].P) return table[0].T;
  if (P >= table[table.length - 1].P) return table[table.length - 1].T;

  for (let i = 0; i < table.length - 1; i++) {
    if (table[i].P <= P && table[i + 1].P >= P) {
      const frac = (P - table[i].P) / (table[i + 1].P - table[i].P);
      return table[i].T + frac * (table[i + 1].T - table[i].T);
    }
  }
  return null;
}

export function detectRegion(T: number, P: number, standard: Standard): Region {
  if (T > CRITICAL_POINT.T && P > CRITICAL_POINT.P) {
    return 'SUPERCRITICAL';
  }

  const Psat = getSatPressureAtT(T, standard);
  if (Psat === null) return 'SUPERHEATED';

  const tolerance = Psat * 0.0001;

  if (Math.abs(P - Psat) <= tolerance) {
    return 'SATURATED';
  }

  if (P > Psat) {
    return 'SUBCOOLED';
  }

  return 'SUPERHEATED';
}
