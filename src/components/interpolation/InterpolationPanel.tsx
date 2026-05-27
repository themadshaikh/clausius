import { useAppStore } from '../../store/appStore';
import { InputForm } from './InputForm';
import { ResultsDisplay } from './ResultsDisplay';
import { RegionIndicator } from '../controls/RegionIndicator';
import { WarningBanner } from '../shared/WarningBanner';

export function InterpolationPanel() {
  const { result, error, detectedRegion } = useAppStore();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '0',
      height: '100%',
      minHeight: 0,
    }}>
      {/* Left: Input panel */}
      <div style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--ui-font)' }}>
            Input Parameters
          </h2>
          <div style={{ marginTop: '4px' }}>
            <RegionIndicator region={detectedRegion} />
          </div>
        </div>
        <InputForm />
      </div>

      {/* Right: Results panel */}
      <div style={{
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {error && <WarningBanner message={error} type="error" />}
        {!result && !error && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--ui-font)',
            fontSize: '0.875rem',
            textAlign: 'center',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>≈</div>
            <div>Enter values and click <strong style={{ color: 'var(--text-secondary)' }}>Calculate</strong> to compute steam properties.</div>
          </div>
        )}
        {result && <ResultsDisplay result={result} />}
      </div>
    </div>
  );
}
