import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@cuemesh/ui';
import { installScriptProbe } from '@cuemesh/ui/debug/scriptProbe';
import { BUILD_INFO, firebaseApp } from './firebase';

installScriptProbe();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App firebaseApp={firebaseApp} buildInfo={BUILD_INFO} />
  </React.StrictMode>
);
