import { useAppStore } from '../../store/appStore';

export function ModeSelector() {
  const { mode, setMode } = useAppStore();

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        gap: '0',
      }}
    >
      {(['INTERPOLATION', 'TABLE_LOOKUP'] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: mode === m ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: mode === m ? 'var(--accent-blue)' : 'var(--text-secondary)',
            padding: '12px 20px',
            fontSize: '0.875rem',
            fontFamily: 'var(--ui-font)',
            fontWeight: mode === m ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
            letterSpacing: '0.01em',
          }}
        >
          {m === 'INTERPOLATION' ? 'Interpolation Mode' : 'Table Lookup'}
        </button>
      ))}
    </div>
  );
}
