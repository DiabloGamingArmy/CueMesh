import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@cuemesh/ui';
import { firebaseApp } from './firebase';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App firebaseApp={firebaseApp} />
  </React.StrictMode>
);
