import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { ShowPage } from './pages/ShowPage';
import { FeedPage } from './pages/FeedPage';
import { DirectorPage } from './pages/DirectorPage';
import { DebugScriptsPanel } from './components/DebugScriptsPanel';
import type { FirebaseApp } from 'firebase/app';
import { useFirebase } from './services/firebase';
import { useEffect, useMemo, useState } from 'react';
import { getAuth, signOut, type User } from 'firebase/auth';
import './styles/tokens.css';
import './styles/app.css';
import './styles/base.css';

const themeOptions = [
  { value: 'hc-dark', label: 'HC Dark' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'hc-light', label: 'HC Light' }
] as const;

const useTheme = () => {
  const [theme, setTheme] = useState('hc-dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('cuemesh-theme');
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('cuemesh-theme', theme);
  }, [theme]);

  return { theme, setTheme };
};

export type AppProps = {
  firebaseApp: FirebaseApp;
};

const RequireAuth = ({
  user,
  authReady,
  children
}: {
  user: User | null;
  authReady: boolean;
  children: React.ReactNode;
}) => {
  if (!authReady) {
    return (
      <div className="cm-panel">
        <h2>Connecting…</h2>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export const App = ({ firebaseApp }: AppProps) => {
  const firebase = useFirebase(firebaseApp);
  const { theme, setTheme } = useTheme();
  const auth = useMemo(() => getAuth(firebaseApp), [firebaseApp]);
  const themeSelect = useMemo(
    () => (
      <select value={theme} onChange={(event) => setTheme(event.target.value)}>
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    [theme, setTheme]
  );
  const rightContent = useMemo(
    () => (
      <div className="cm-row">
        {themeSelect}
        {firebase.user ? (
          <button className="cm-btn" onClick={() => signOut(auth)}>
            Sign out
          </button>
        ) : null}
      </div>
    ),
    [auth, firebase.user, themeSelect]
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            firebase.user ? (
              <Navigate to="/" replace />
            ) : (
              <Layout title="Sign in" right={rightContent}>
                <AuthPage firebase={firebase} />
              </Layout>
            )
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth user={firebase.user} authReady={firebase.authReady}>
              <Layout title="Create or join" right={rightContent}>
                <LandingPage firebase={firebase} />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/show/:showId"
          element={
            <RequireAuth user={firebase.user} authReady={firebase.authReady}>
              <Layout title="Show lobby" right={rightContent}>
                <ShowPage firebase={firebase} />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/show/:showId/feed"
          element={
            <RequireAuth user={firebase.user} authReady={firebase.authReady}>
              <Layout title="Operator feed" right={rightContent}>
                <FeedPage firebase={firebase} />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/show/:showId/director"
          element={
            <RequireAuth user={firebase.user} authReady={firebase.authReady}>
              <Layout title="Director console" right={rightContent}>
                <DirectorPage firebase={firebase} />
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
      <DebugScriptsPanel />
    </BrowserRouter>
  );
};
