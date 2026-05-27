import { useState } from 'react';
import type { InterpolationWork, InterpolationResult } from '../../engine/types';
import { convertPropertyToDisplay, unitLabels, formatValue } from '../../engine/units';

interface Props {
  work: InterpolationWork;
  result: InterpolationResult;
}

export function ShowWorkPanel({ work, result }: Props) {
  const [open, setOpen] = useState(true);
  const labels = unitLabels[result.unitSystem];


  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '6px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'var(--bg-surface)',
          border: 'none',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--ui-font)',
          fontSize: '0.82rem',
          fontWeight: 600,
        }}
      >
        <span>▼ Show Interpolation Work</span>
        <span style={{ transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s', fontSize: '0.75em' }}>▲</span>
      </button>

      {open && (
        <div style={{
          background: 'var(--bg-primary)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {/* Formula section */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '12px 14px',
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--ui-font)', marginBottom: '8px', fontWeight: 600 }}>
              Calculation
            </div>
            <pre style={{
              margin: 0,
              fontFamily: 'var(--mono-font)',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
            }}>
              {work.formula}
            </pre>
          </div>

          {/* Bounding points */}
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--ui-font)', marginBottom: '8px', fontWeight: 600 }}>
              Bounding Points
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <BoundDisplay label="Lower bound" bound={work.lowerBound} unitSystem={result.unitSystem} />
              <BoundDisplay label="Upper bound" bound={work.upperBound} unitSystem={result.unitSystem} />
            </div>
          </div>

          {/* Fraction */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Pill label="Interpolation fraction" value={formatValue(work.fraction, 6)} />
            <Pill label="Method" value={result.interpolationType} />
          </div>

          {/* Bilinear steps */}
          {work.intermediateSteps && work.intermediateSteps.length > 0 && (
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontFamily: 'var(--ui-font)', marginBottom: '8px', fontWeight: 600 }}>
                Bilinear Intermediate Steps
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {work.intermediateSteps.map((step, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '0.76rem',
                    fontFamily: 'var(--mono-font)',
                    color: 'var(--text-secondary)',
                  }}>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{step.property}</span>: {step.description}
                    {' → '}<span style={{ color: 'var(--text-primary)' }}>{formatValue(step.result, 6)} {labels[step.property] ?? ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BoundDisplay({ label, bound, unitSystem }: {
  label: string;
  bound: { index: number | string; values: Partial<Record<string, number>> };
  unitSystem: 'SI' | 'IMPERIAL';
}) {
  const labels = unitLabels[unitSystem];
  const keyProps = ['T', 'P', 'hf', 'hg', 'sf', 'sg', 'vf', 'vg'];

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '8px 10px',
    }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontFamily: 'var(--ui-font)', marginBottom: '6px' }}>{label}</div>
      <div style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontFamily: 'var(--mono-font)', marginBottom: '4px' }}>
        @ {bound.index}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {keyProps.map((k) => {
          const v = bound.values[k];
          if (v === undefined || typeof v !== 'number') return null;
          const disp = convertPropertyToDisplay(k, v, unitSystem);
          return (
            <div key={k} style={{ display: 'flex', gap: '6px', fontSize: '0.72rem', fontFamily: 'var(--mono-font)', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)', width: '28px' }}>{k}</span>
              <span style={{ color: 'var(--text-primary)' }}>{formatValue(disp, 6)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{labels[k] ?? ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      padding: '4px 10px',
      fontSize: '0.75rem',
      fontFamily: 'var(--ui-font)',
      color: 'var(--text-secondary)',
    }}>
      <span>{label}: </span>
      <span style={{ fontFamily: 'var(--mono-font)', color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
