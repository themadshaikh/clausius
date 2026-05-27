import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { TableGrid } from './TableGrid';
import { WarningBanner } from '../shared/WarningBanner';
import { getTable } from '../../data/index';
import type { SteamProperties, TableType } from '../../engine/types';
import { exportSatTableCSV } from '../../utils/csv';
import { convertInputToSI } from '../../engine/units';
import { unitLabels } from '../../engine/units';

const LOOKUP_TABLE_OPTIONS: { value: TableType; label: string }[] = [
  { value: 'SATURATED_TEMPERATURE', label: 'Saturated — by Temperature' },
  { value: 'SATURATED_PRESSURE', label: 'Saturated — by Pressure' },
];

const DATA_INTEGRITY_WARNINGS = [
  'These are tabulated reference values reproduced for educational and engineering reference purposes. They are not a substitute for the original published standards.',
  'Tabulated steam tables are discretized data — they represent property values only at the specific listed state points.',
  'Different published standards may list marginally different values at identical state points due to differences in the underlying equations of state.',
  'Do not cite this portal as a primary source in engineering documentation.',
];

export function TableLookupPanel() {
  const {
    standard, unitSystem,
    lookupTableType, setLookupTableType,
    lookupIndex, setLookupIndex,
    lookupResult,
    showFullTable, setShowFullTable,
    lookup, error,
  } = useAppStore();

  const [noticesOpen, setNoticesOpen] = useState(true);
  const [inputVal, setInputVal] = useState('');

  const labels = unitLabels[unitSystem];
  const indexProp = lookupTableType === 'SATURATED_TEMPERATURE' ? 'T' : 'P';
  const indexLabel = indexProp === 'T' ? `Temperature (${labels['T']})` : `Pressure (${labels['P']})`;

  const fullTable = (() => {
    try {
      return getTable(standard, lookupTableType) as SteamProperties[];
    } catch { return []; }
  })();

  const handleInput = (v: string) => {
    setInputVal(v);
    if (v === '') { setLookupIndex(null); return; }
    const num = parseFloat(v);
    if (!isNaN(num)) {
      setLookupIndex(convertInputToSI(indexProp, num, unitSystem));
    }
  };

  const handleExport = () => {
    exportSatTableCSV(fullTable, `steam_${standard}_${lookupTableType.toLowerCase()}.csv`, unitSystem);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Data integrity notices */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
        <button
          onClick={() => setNoticesOpen(!noticesOpen)}
          style={{
            width: '100%',
            background: 'var(--bg-surface)',
            border: 'none',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'var(--accent-amber)',
            fontFamily: 'var(--ui-font)',
            fontSize: '0.82rem',
            fontWeight: 600,
            borderBottom: noticesOpen ? '1px solid var(--border)' : 'none',
          }}
        >
          ⚠ Data Integrity Notices
          <span style={{ fontSize: '0.75em' }}>{noticesOpen ? '▲' : '▼'}</span>
        </button>
        {noticesOpen && (
          <div style={{ background: 'var(--bg-primary)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DATA_INTEGRITY_WARNINGS.map((w, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px', alignItems: 'flex-start',
                color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--ui-font)',
              }}>
                <span style={{ color: 'var(--accent-amber)', flexShrink: 0 }}>⚠</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Table selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--ui-font)' }}>Table</label>
          <select
            value={lookupTableType}
            onChange={(e) => setLookupTableType(e.target.value as TableType)}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--ui-font)',
              fontSize: '0.82rem',
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            {LOOKUP_TABLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Index input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--ui-font)' }}>
            Lookup {indexLabel}
          </label>
          <div style={{ display: 'flex', gap: '0' }}>
            <input
              type="number"
              value={inputVal}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={indexProp === 'T' ? 'e.g. 100' : 'e.g. 1.0'}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '4px 0 0 4px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--mono-font)',
                fontSize: '0.875rem',
                padding: '6px 10px',
                width: '130px',
                outline: 'none',
              }}
            />
            <button
              onClick={lookup}
              style={{
                background: 'var(--accent-blue)',
                color: '#fff',
                border: 'none',
                borderRadius: '0 4px 4px 0',
                padding: '6px 14px',
                fontFamily: 'var(--ui-font)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Lookup
            </button>
          </div>
        </div>

        {/* Show full table toggle */}
        <button
          onClick={() => setShowFullTable(!showFullTable)}
          style={{
            background: showFullTable ? 'var(--accent-blue)' : 'var(--bg-elevated)',
            color: showFullTable ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${showFullTable ? 'var(--accent-blue)' : 'var(--border)'}`,
            borderRadius: '4px',
            padding: '6px 14px',
            fontFamily: 'var(--ui-font)',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          {showFullTable ? '▲ Hide Table' : '▼ Show Full Table'}
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExport}
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--accent-green)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '6px 14px',
            fontFamily: 'var(--ui-font)',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Error / lookup result */}
      {error && <WarningBanner message={error} type="error" />}

      {lookupResult && !lookupResult.exactMatch && lookupResult.message && (
        <WarningBanner message={lookupResult.message} type="info" />
      )}

      {lookupResult?.exactMatch && (
        <div style={{
          background: 'rgba(61,214,140,0.08)',
          border: '1px solid rgba(61,214,140,0.3)',
          borderRadius: '6px',
          padding: '10px 14px',
          color: 'var(--accent-green)',
          fontSize: '0.82rem',
          fontFamily: 'var(--ui-font)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <span>✓</span>
          <span>Exact tabulated entry found — row highlighted below.</span>
        </div>
      )}

      {/* Table grid */}
      {(showFullTable || lookupResult) && fullTable.length > 0 && (
        <TableGrid
          rows={fullTable}
          unitSystem={unitSystem}
          highlightIndex={lookupResult?.exactMatch ? lookupIndex ?? undefined : undefined}
          highlightProp={indexProp}
        />
      )}

      {!showFullTable && !lookupResult && !error && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--ui-font)',
          fontSize: '0.875rem',
        }}>
          Enter a value and click <strong style={{ color: 'var(--text-secondary)' }}>Lookup</strong> to find an exact tabulated entry,
          or click <strong style={{ color: 'var(--text-secondary)' }}>Show Full Table</strong> to browse all data.
        </div>
      )}
    </div>
  );
}
