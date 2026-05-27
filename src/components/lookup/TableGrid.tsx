import type { SteamProperties } from '../../engine/types';
import type { UnitSystem } from '../../engine/types';
import { convertPropertyToDisplay, unitLabels, formatValue } from '../../engine/units';
import { CriticalPointFlag } from '../shared/CriticalPointFlag';
import { copyRowToClipboard } from '../../utils/csv';

const COLUMNS = [
  { key: 'T',   label: 'T',   desc: 'Temperature' },
  { key: 'P',   label: 'P',   desc: 'Pressure' },
  { key: 'hf',  label: 'hf',  desc: 'Sat. Liquid Enthalpy' },
  { key: 'hfg', label: 'hfg', desc: 'Evap. Enthalpy' },
  { key: 'hg',  label: 'hg',  desc: 'Sat. Vapor Enthalpy' },
  { key: 'sf',  label: 'sf',  desc: 'Sat. Liquid Entropy' },
  { key: 'sfg', label: 'sfg', desc: 'Evap. Entropy' },
  { key: 'sg',  label: 'sg',  desc: 'Sat. Vapor Entropy' },
  { key: 'vf',  label: 'vf',  desc: 'Sat. Liquid Spec. Volume' },
  { key: 'vg',  label: 'vg',  desc: 'Sat. Vapor Spec. Volume' },
  { key: 'uf',  label: 'uf',  desc: 'Sat. Liquid Int. Energy' },
  { key: 'ufg', label: 'ufg', desc: 'Evap. Int. Energy' },
  { key: 'ug',  label: 'ug',  desc: 'Sat. Vapor Int. Energy' },
];

interface Props {
  rows: SteamProperties[];
  unitSystem: UnitSystem;
  highlightIndex?: number | null;
  highlightProp?: 'T' | 'P';
}

export function TableGrid({ rows, unitSystem, highlightIndex, highlightProp }: Props) {
  const labels = unitLabels[unitSystem];

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '1100px' }}>
        <thead className="sticky-header">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                title={col.desc}
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--mono-font)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '8px 10px',
                  textAlign: 'right',
                  borderBottom: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                  cursor: 'help',
                  userSelect: 'none',
                }}
              >
                <em>{col.label}</em>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'normal', fontWeight: 400 }}>
                  {labels[col.key] ?? ''}
                </div>
              </th>
            ))}
            <th style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--ui-font)',
              fontSize: '0.7rem',
              padding: '8px 10px',
              borderBottom: '1px solid var(--border)',
              whiteSpace: 'nowrap',
            }}>
              Copy
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isHighlighted =
              highlightIndex !== undefined &&
              highlightIndex !== null &&
              highlightProp &&
              Math.abs(row[highlightProp] - highlightIndex) < 1e-6;

            return (
              <tr
                key={i}
                style={{
                  background: isHighlighted
                    ? 'rgba(61,214,140,0.08)'
                    : i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-surface)',
                  border: isHighlighted ? '1px solid rgba(61,214,140,0.4)' : 'none',
                }}
              >
                {COLUMNS.map((col) => {
                  const raw = (row as unknown as Record<string, number | undefined>)[col.key];
                  const disp = raw !== undefined ? convertPropertyToDisplay(col.key, raw, unitSystem) : undefined;
                  return (
                    <td
                      key={col.key}
                      style={{
                        fontFamily: 'var(--mono-font)',
                        fontSize: '0.78rem',
                        color: isHighlighted ? 'var(--accent-green)' : 'var(--text-primary)',
                        padding: '5px 10px',
                        textAlign: 'right',
                        borderRight: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {disp !== undefined ? formatValue(disp, 6) : '—'}
                      {col.key === 'T' && row.nearCriticalPoint && <CriticalPointFlag inline />}
                    </td>
                  );
                })}
                <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                  <button
                    onClick={() => copyRowToClipboard(row)}
                    title="Copy row as tab-separated values"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '3px',
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--ui-font)',
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
