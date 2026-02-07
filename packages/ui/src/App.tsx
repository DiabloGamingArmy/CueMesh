import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ShowPage } from './pages/ShowPage';
import { FeedPage } from './pages/FeedPage';
import { DirectorPage } from './pages/DirectorPage';
import type { FirebaseApp } from 'firebase/app';
import { useFirebase } from './services/firebase';
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
            <Layout>
              <LandingPage firebase={firebase} />
            </Layout>
          }
        />
        <Route
          path="/show/:showId"
          element={
            <Layout>
              <ShowPage firebase={firebase} />
            </Layout>
          }
        />
        <Route
          path="/show/:showId/feed"
          element={
            <Layout>
              <FeedPage firebase={firebase} />
            </Layout>
          }
        />
        <Route
          path="/show/:showId/director"
          element={
            <Layout>
              <DirectorPage firebase={firebase} />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
