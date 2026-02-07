import { Link } from 'react-router-dom';
import './layout.css';

type LayoutProps = {
  showId?: string;
  children: React.ReactNode;
};

export const Layout = ({ showId, children }: LayoutProps) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="brand">CueMesh</div>
        <nav className="nav">
          <Link to="/">Home</Link>
          {showId && <Link to={`/show/${showId}`}>Show</Link>}
          {showId && <Link to={`/show/${showId}/feed`}>Feed</Link>}
          {showId && <Link to={`/show/${showId}/director`}>Director</Link>}
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  );
};
