type ErrorBannerProps = {
  message: string;
};

export const ErrorBanner = ({ message }: ErrorBannerProps) => {
  return (
    <div className="cm-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
      <div className="cm-panel-bd">
        <strong style={{ color: 'var(--bad)' }}>Error</strong>
        <div style={{ marginTop: 6, color: 'var(--muted)' }}>{message}</div>
      </div>
    </div>
  );
};
