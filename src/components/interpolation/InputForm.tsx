import { useAppStore } from '../../store/appStore';
import { unitLabels, convertInputToSI } from '../../engine/units';
import type { TableType } from '../../engine/types';

const TABLE_OPTIONS: { value: TableType; label: string; available: boolean }[] = [
  { value: 'SATURATED_TEMPERATURE', label: 'Saturated — by Temperature', available: true },
  { value: 'SATURATED_PRESSURE', label: 'Saturated — by Pressure', available: true },
  { value: 'SUPERHEATED', label: 'Superheated Steam', available: true },
  { value: 'COMPRESSED_LIQUID', label: 'Compressed Liquid', available: true },
];

function inputField(
  label: string,
  unitLabel: string,
  value: string,
  onChange: (v: string) => void,
  placeholder = ''
) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--ui-font)' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '4px 0 0 4px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--mono-font)',
            fontSize: '0.9rem',
            padding: '7px 10px',
            width: '100%',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-active)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <span style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderLeft: 'none',
          borderRadius: '0 4px 4px 0',
          color: 'var(--text-muted)',
          fontFamily: 'var(--ui-font)',
          fontSize: '0.75rem',
          padding: '7px 8px',
          whiteSpace: 'nowrap',
        }}>
          {unitLabel}
        </span>
      </div>
    </div>
  );
}

export function InputForm() {
  const { tableType, setTableType, inputs, setInput, calculate, isCalculating, unitSystem, standard } = useAppStore();
  const labels = unitLabels[unitSystem];

  const tVal = inputs.T !== undefined ? String(inputs.T) : '';
  const pVal = inputs.P !== undefined ? String(inputs.P) : '';
  const xVal = inputs.x !== undefined ? String(inputs.x) : '';

  const handleT = (v: string) => {
    if (v === '') { setInput('T', undefined); return; }
    const num = parseFloat(v);
    if (!isNaN(num)) setInput('T', convertInputToSI('T', num, unitSystem));
  };
  const handleP = (v: string) => {
    if (v === '') { setInput('P', undefined); return; }
    const num = parseFloat(v);
    if (!isNaN(num)) setInput('P', convertInputToSI('P', num, unitSystem));
  };
  const handleX = (v: string) => {
    if (v === '') { setInput('x', undefined); return; }
    const num = parseFloat(v);
    if (!isNaN(num)) setInput('x', num);
  };

  const showQuality =
    tableType === 'SATURATED_TEMPERATURE' || tableType === 'SATURATED_PRESSURE';

  const iapws95NosuperHeat = standard === 'IAPWS-95' && (tableType === 'SUPERHEATED' || tableType === 'COMPRESSED_LIQUID');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Table type selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--ui-font)' }}>
          Table type
        </label>
        <select
          value={tableType}
          onChange={(e) => setTableType(e.target.value as TableType)}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--ui-font)',
            fontSize: '0.85rem',
            padding: '7px 10px',
            cursor: 'pointer',
          }}
        >
          {TABLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={!opt.available}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {iapws95NosuperHeat && (
        <div style={{
          border: '1px solid var(--accent-amber)',
          borderRadius: '6px',
          background: 'rgba(245,166,35,0.08)',
          padding: '10px 12px',
          color: 'var(--accent-amber)',
          fontSize: '0.78rem',
          fontFamily: 'var(--ui-font)',
        }}>
          ⚠ IAPWS-95 provides saturated tables only. Switch to IAPWS-IF97 for superheated or compressed liquid calculations.
        </div>
      )}

      {/* Input fields based on table type */}
      {tableType === 'SATURATED_TEMPERATURE' && (
        <>
          {inputField('Temperature', labels['T'], tVal, handleT, 'e.g. 150')}
          {showQuality && inputField('Steam quality x (optional)', '0–1', xVal, handleX, 'e.g. 0.8')}
        </>
      )}

      {tableType === 'SATURATED_PRESSURE' && (
        <>
          {inputField('Pressure', labels['P'], pVal, handleP, 'e.g. 1.0')}
          {showQuality && inputField('Steam quality x (optional)', '0–1', xVal, handleX, 'e.g. 0.8')}
        </>
      )}

      {tableType === 'SUPERHEATED' && (
        <>
          {inputField('Pressure', labels['P'], pVal, handleP, 'e.g. 1.0')}
          {inputField('Temperature', labels['T'], tVal, handleT, 'e.g. 300')}
        </>
      )}

      {tableType === 'COMPRESSED_LIQUID' && (
        <>
          {inputField('Pressure', labels['P'], pVal, handleP, 'e.g. 5.0')}
          {inputField('Temperature', labels['T'], tVal, handleT, 'e.g. 100')}
        </>
      )}

      <button
        onClick={calculate}
        disabled={isCalculating || iapws95NosuperHeat}
        style={{
          background: isCalculating ? 'var(--bg-elevated)' : 'var(--accent-blue)',
          color: isCalculating ? 'var(--text-muted)' : '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '9px 18px',
          fontFamily: 'var(--ui-font)',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: isCalculating ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          letterSpacing: '0.01em',
        }}
      >
        {isCalculating ? 'Calculating…' : 'Calculate'}
      </button>
    </div>
  );
}
