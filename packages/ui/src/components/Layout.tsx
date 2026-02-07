type LayoutProps = {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

export const Layout = ({ title, right, children }: LayoutProps) => {
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
          {right}
        </div>
      </header>
      {children}
    </div>
  );
};
