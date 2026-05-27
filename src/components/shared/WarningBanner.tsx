interface Props {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export function WarningBanner({ message, type = 'error' }: Props) {
  const colors = {
    error: { border: 'var(--accent-red)', bg: 'rgba(224,82,82,0.08)', color: 'var(--accent-red)', icon: '⚠' },
    warning: { border: 'var(--accent-amber)', bg: 'rgba(245,166,35,0.08)', color: 'var(--accent-amber)', icon: '⚠' },
    info: { border: 'var(--accent-blue)', bg: 'rgba(77,157,224,0.08)', color: 'var(--accent-blue)', icon: 'ℹ' },
  }[type];

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        background: colors.bg,
        padding: '12px 16px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}
    >
      <span style={{ color: colors.color, fontSize: '1rem', flexShrink: 0, lineHeight: 1.5 }}>{colors.icon}</span>
      <span style={{ color: colors.color, fontSize: '0.82rem', fontFamily: 'var(--ui-font)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {message}
      </span>
    </div>
  );
}
