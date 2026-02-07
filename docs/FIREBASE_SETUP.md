# Firebase Setup

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- A Firebase project created in the Firebase Console

## Initialization (manual steps)
1. Run `firebase init` and choose:
   - Firestore (rules + indexes)
   - Functions (TypeScript)
   - Hosting
2. Point Firestore rules to `firebase/firestore.rules`.
3. Point indexes to `firebase/firestore.indexes.json`.
4. Set hosting public directory to `apps/web/dist` and configure single-page app rewrites.

## Environment Variables
Copy the template:
- `apps/web/.env.example` → `apps/web/.env`
- `apps/desktop/.env.example` → `apps/desktop/.env`

## Emulator Tips
- Run `firebase emulators:start` to test Auth + Firestore + Functions locally.
- Update the web app to connect to emulators as needed (optional).

## Deployment
- Build the web app: `pnpm build:web`
- Deploy: `firebase deploy --only hosting,functions,firestore`
