import { saveAs } from 'file-saver';
import type { SteamProperties } from '../engine/types';

export function exportSatTableCSV(
  rows: SteamProperties[],
  filename: string,
  unitSystem: 'SI' | 'IMPERIAL'
) {
  const headers = ['T', 'P', 'hf', 'hfg', 'hg', 'sf', 'sfg', 'sg', 'vf', 'vg', 'uf', 'ufg', 'ug'];
  const units = unitSystem === 'SI'
    ? ['°C', 'MPa', 'kJ/kg', 'kJ/kg', 'kJ/kg', 'kJ/(kg·K)', 'kJ/(kg·K)', 'kJ/(kg·K)', 'm³/kg', 'm³/kg', 'kJ/kg', 'kJ/kg', 'kJ/kg']
    : ['°F', 'psia', 'BTU/lbm', 'BTU/lbm', 'BTU/lbm', 'BTU/(lbm·°R)', 'BTU/(lbm·°R)', 'BTU/(lbm·°R)', 'ft³/lbm', 'ft³/lbm', 'BTU/lbm', 'BTU/lbm', 'BTU/lbm'];

  const headerRow = headers.join(',');
  const unitRow = units.join(',');
  const dataRows = rows.map((r) => {
    const row = r as unknown as Record<string, unknown>;
    return headers.map((h) => row[h] ?? '').join(',');
  });

  const csv = [headerRow, unitRow, ...dataRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

export function copyRowToClipboard(row: SteamProperties): void {
  const keys = ['T', 'P', 'hf', 'hfg', 'hg', 'sf', 'sfg', 'sg', 'vf', 'vg', 'uf', 'ufg', 'ug'];
  const r = row as unknown as Record<string, unknown>;
  const values = keys.map((k) => r[k] ?? '').join('\t');
  navigator.clipboard.writeText(values).catch(() => {
    // Fallback: do nothing silently (not a critical failure)
  });
}
