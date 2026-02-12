type LayoutProps = {
  title?: string;
  right?: React.ReactNode;
  buildInfo?: {
    sha: string;
    time: string;
  };
  children: React.ReactNode;
};

export const Layout = ({ title, right, buildInfo, children }: LayoutProps) => {
  const buildShaShort = (buildInfo?.sha ?? 'dev').slice(0, 7);
  const buildTime = buildInfo?.time ?? 'local';

  return (
    <div className="cm-app">
      <header className="cm-topbar">
        <div className="cm-topbar-inner">
          <div className="cm-brand">
            <span className="cm-dot" />
            <span>CueMesh</span>
          </div>
          <span className="cm-chip">{title ?? 'Live cueing'}</span>
          <div className="cm-spacer" />
          <div className="cm-build-stamp" title={`Build ${buildShaShort} / ${buildTime}`}>
            {buildShaShort} • {buildTime}
          </div>
          {right}
        </div>
      </header>
      {children}
    </div>
  );
};
