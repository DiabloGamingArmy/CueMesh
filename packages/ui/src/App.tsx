import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ShowPage } from './pages/ShowPage';
import { FeedPage } from './pages/FeedPage';
import { DirectorPage } from './pages/DirectorPage';
import type { FirebaseApp } from 'firebase/app';
import { useFirebase } from './services/firebase';
import './styles/tokens.css';
import './styles/app.css';
import './styles/base.css';

export type AppProps = {
  firebaseApp: FirebaseApp;
};

export const App = ({ firebaseApp }: AppProps) => {
  const firebase = useFirebase(firebaseApp);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title="Create or join">
              <LandingPage firebase={firebase} />
            </Layout>
          }
        />
        <Route
          path="/show/:showId"
          element={
            <Layout title="Show lobby">
              <ShowPage firebase={firebase} />
            </Layout>
          }
        />
        <Route
          path="/show/:showId/feed"
          element={
            <Layout title="Operator feed">
              <FeedPage firebase={firebase} />
            </Layout>
          }
        />
        <Route
          path="/show/:showId/director"
          element={
            <Layout title="Director console">
              <DirectorPage firebase={firebase} />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
