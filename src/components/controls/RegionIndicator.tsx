import type { Region } from '../../engine/types';

const REGION_CONFIG: Record<Region, { color: string; bg: string; label: string; desc: string }> = {
  SUBCOOLED: {
    color: '#4d9de0',
    bg: 'rgba(77,157,224,0.12)',
    label: 'Subcooled Liquid',
    desc: 'P > Psat at given T',
  },
  SATURATED: {
    color: '#3dd68c',
    bg: 'rgba(61,214,140,0.12)',
    label: 'Saturated / Two-Phase',
    desc: 'P ≈ Psat at given T',
  },
  SUPERHEATED: {
    color: '#f5a623',
    bg: 'rgba(245,166,35,0.12)',
    label: 'Superheated Vapor',
    desc: 'P < Psat at given T',
  },
  SUPERCRITICAL: {
    color: '#9b6dff',
    bg: 'rgba(155,109,255,0.12)',
    label: 'Supercritical',
    desc: 'T > 374.14°C and P > 22.089 MPa',
  },
};

interface Props {
  region: Region | null;
}

export function RegionIndicator({ region }: Props) {
  if (!region) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '4px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: '0.78rem',
        fontFamily: 'var(--ui-font)',
      }}>
        <span>Region: —</span>
      </div>
    );
  }

  const cfg = REGION_CONFIG[region];
  return (
    <div
      title={cfg.desc}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '4px',
        background: cfg.bg,
        border: `1px solid ${cfg.color}40`,
        color: cfg.color,
        fontSize: '0.78rem',
        fontFamily: 'var(--ui-font)',
        fontWeight: 600,
      }}
    >
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: cfg.color, flexShrink: 0,
      }} />
      {cfg.label}
    </div>
  );
}
