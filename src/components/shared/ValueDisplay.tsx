import { convertPropertyToDisplay, unitLabels, formatValue } from '../../engine/units';
import type { UnitSystem } from '../../engine/types';

interface Props {
  label: string;
  symbol: string;
  value: number | undefined;
  propKey: string;
  unitSystem: UnitSystem;
  isInterpolated?: boolean;
  sigFigs?: number;
}

export function ValueDisplay({ label, symbol, value, propKey, unitSystem, isInterpolated = false, sigFigs = 6 }: Props) {
  if (value === undefined || value === null || isNaN(value)) {
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--ui-font)' }}>{label}</span>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono-font)', fontSize: '0.9rem' }}>—</span>
      </div>
    );
  }

  const displayVal = convertPropertyToDisplay(propKey, value, unitSystem);
  const unit = unitLabels[unitSystem][propKey] ?? '';
  const badgeColor = isInterpolated ? 'var(--accent-purple)' : 'var(--accent-green)';
  const badgeBg = isInterpolated ? 'rgba(155,109,255,0.12)' : 'rgba(61,214,140,0.12)';
  const badgeLabel = isInterpolated ? 'Interpolated' : 'Tabulated';

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: `1px solid var(--border)`,
      borderRadius: '6px',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--ui-font)' }}>
          {label} <em style={{ fontStyle: 'italic' }}>({symbol})</em>
        </span>
        <span style={{
          fontSize: '0.65rem',
          fontFamily: 'var(--ui-font)',
          color: badgeColor,
          background: badgeBg,
          border: `1px solid ${badgeColor}40`,
          borderRadius: '3px',
          padding: '1px 5px',
        }}>
          {badgeLabel}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--mono-font)', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 500 }}>
          {formatValue(displayVal, sigFigs)}
        </span>
        <span style={{ fontFamily: 'var(--ui-font)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {unit}
        </span>
      </div>
    </div>
  );
}
