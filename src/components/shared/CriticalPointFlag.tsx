interface Props {
  inline?: boolean;
}

export function CriticalPointFlag({ inline = false }: Props) {
  const tooltip = 'Near critical point — property gradients are extremely steep in this region. Tabulated values are sensitive to small state changes.';

  if (inline) {
    return (
      <span
        title={tooltip}
        style={{
          color: 'var(--accent-amber)',
          fontSize: '0.85em',
          cursor: 'help',
          marginLeft: '4px',
        }}
      >
        ⚠
      </span>
    );
  }

  return (
    <div
      title={tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: 'var(--accent-amber)',
        background: 'rgba(245,166,35,0.08)',
        border: '1px solid rgba(245,166,35,0.25)',
        borderRadius: '3px',
        padding: '2px 6px',
        fontSize: '0.72rem',
        fontFamily: 'var(--ui-font)',
        cursor: 'help',
      }}
    >
      ⚠ Near critical point
    </div>
  );
}
