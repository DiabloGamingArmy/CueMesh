import { initializeApp } from 'firebase/app';

export const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

export const BUILD_INFO = {
  sha: import.meta.env.VITE_BUILD_SHA ?? 'dev',
  time: import.meta.env.VITE_BUILD_TIME ?? 'local'
};
