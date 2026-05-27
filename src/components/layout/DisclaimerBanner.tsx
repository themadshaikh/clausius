export function DisclaimerBanner() {
  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '8px 24px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.78rem',
        fontFamily: 'var(--ui-font)',
        position: 'sticky',
        bottom: 0,
        zIndex: 50,
      }}
    >
      Values are based on referenced steam table data. Always verify critical engineering
      calculations against primary published standards.
    </footer>
  );
}
