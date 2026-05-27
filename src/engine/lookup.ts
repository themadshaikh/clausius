import type {
  TableType,
  Standard,
  LookupResult,
  SteamProperties,
  SuperheatedPressureSlice,
} from './types';
import { OutOfBoundsError } from './types';
import { getTable } from '../data/index';

export function exactLookup(
  index: number,
  tableType: TableType,
  standard: Standard,
  tolerance = 0
): LookupResult {
  if (tableType === 'SATURATED_TEMPERATURE') {
    const table = getTable(standard, tableType) as SteamProperties[];
    return findInTable(index, table, 'T', tolerance);
  }

  if (tableType === 'SATURATED_PRESSURE') {
    const table = getTable(standard, tableType) as SteamProperties[];
    return findInTable(index, table, 'P', tolerance);
  }

  throw new Error(`exactLookup does not support tableType: ${tableType}`);
}

function findInTable(
  index: number,
  table: SteamProperties[],
  key: 'T' | 'P',
  tolerance: number
): LookupResult {
  if (!table || table.length === 0) {
    throw new OutOfBoundsError('Table is empty or unavailable.');
  }

  const min = table[0][key];
  const max = table[table.length - 1][key];

  if (index < min || index > max) {
    throw new OutOfBoundsError(
      `Input out of table bounds — extrapolation beyond this range is not ` +
      `thermodynamically validated. Proceed with caution or consult extended ` +
      `data sources.\n` +
      `Table range: ${min} to ${max}.\n` +
      `Your input: ${index}.`
    );
  }

  for (const row of table) {
    if (Math.abs(row[key] - index) <= tolerance) {
      return { exactMatch: true, row };
    }
  }

  let lo = -1;
  let hi = -1;
  for (let i = 0; i < table.length - 1; i++) {
    if (table[i][key] <= index && table[i + 1][key] >= index) {
      lo = i;
      hi = i + 1;
      break;
    }
  }

  if (lo < 0) {
    return { exactMatch: false };
  }

  return {
    exactMatch: false,
    lowerBound: { index: table[lo][key], row: table[lo] },
    upperBound: { index: table[hi][key], row: table[hi] },
    message:
      `No exact tabulated entry exists for this input. Switch to Interpolation Mode ` +
      `to compute an estimated value between the two nearest data points: ` +
      `${table[lo][key]} and ${table[hi][key]}.`,
  };
}

export function getFullTable(
  tableType: TableType,
  standard: Standard
): SteamProperties[] | SuperheatedPressureSlice[] {
  return getTable(standard, tableType) as SteamProperties[] | SuperheatedPressureSlice[];
}
