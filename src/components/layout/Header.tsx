import { useAppStore } from '../../store/appStore';
import type { Standard, UnitSystem } from '../../engine/types';

const STANDARDS: { value: Standard; label: string; tooltip: string }[] = [
  {
    value: 'IAPWS-IF97',
    label: 'IAPWS-IF97',
    tooltip: 'IAPWS Industrial Formulation 1997 — Wagner & Kruse (1998). Primary industrial standard.',
  },
  {
    value: 'IAPWS-95',
    label: 'IAPWS-95',
    tooltip: 'IAPWS-95 Scientific Formulation — Wagner & Pruß (2002). Higher accuracy, particularly near the critical point. Saturated tables only.',
  },
  {
    value: 'CENGEL-BOLES',
    label: 'Çengel & Boles',
    tooltip: 'Values consistent with Çengel & Boles, Thermodynamics: An Engineering Approach, 8th Ed. Differences from IAPWS-IF97 reflect textbook rounding.',
  },
  {
    value: 'ASME-IF97',
    label: 'ASME-IF97',
    tooltip: 'ASME Steam Tables (IAPWS-IF97 basis). For ASME code compliance work, consult the licensed ASME publication directly. This portal is not affiliated with ASME.',
  },
];

export function Header() {
  const { standard, setStandard, unitSystem, setUnitSystem } = useAppStore();

  return (
    <header
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8 2 4 6 4 10c0 3 2 6 4 8l4 4 4-4c2-2 4-5 4-8 0-4-4-8-8-8z" stroke="var(--accent-blue)" strokeWidth="1.5" fill="none"/>
          <circle cx="12" cy="10" r="3" fill="var(--accent-blue)" opacity="0.6"/>
          <path d="M7 16l5 5 5-5" stroke="var(--accent-blue)" strokeWidth="1.5" fill="none" opacity="0.4"/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
            Steam Table Portal
          </span>
          <span style={{ fontFamily: 'var(--ui-font)', fontSize: '0.68rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Entropy always increases — except in well-organized steam tables.
          </span>
        </div>
      </div>

      {/* Standard selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--ui-font)', whiteSpace: 'nowrap' }}>
          Standard:
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {STANDARDS.map((s) => (
            <button
              key={s.value}
              title={s.tooltip}
              onClick={() => setStandard(s.value)}
              style={{
                background: standard === s.value ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                color: standard === s.value ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${standard === s.value ? 'var(--accent-blue)' : 'var(--border)'}`,
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontFamily: 'var(--ui-font)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unit toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--ui-font)' }}>Units:</span>
        <div style={{ display: 'flex', gap: '0', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          {(['SI', 'IMPERIAL'] as UnitSystem[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnitSystem(u)}
              style={{
                background: unitSystem === u ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                color: unitSystem === u ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontFamily: 'var(--ui-font)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {u === 'SI' ? 'SI' : 'Imperial'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
