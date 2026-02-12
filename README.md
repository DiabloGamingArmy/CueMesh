# CueMesh

CueMesh is a real-time theatre cue system with a shared web UI and a desktop wrapper.

## Prerequisites
- Node.js 20+
- PNPM 9+
- Firebase CLI (for hosting/functions deploy)
- Rust toolchain (for desktop builds)

## Install
```bash
pnpm install
```

## Development
```bash
pnpm dev:web
pnpm dev:desktop
```

## Linting and Type Checks
```bash
pnpm lint
pnpm typecheck
```

## Build
```bash
pnpm build:web
pnpm build:desktop
```

## Deployment Overview
1. Build the web app: `pnpm build:web`.
2. Deploy Firebase hosting + functions: `firebase deploy --only hosting,functions,firestore`.

## Environment Setup
Copy the templates:
- `apps/web/.env.example` → `apps/web/.env`
- `apps/desktop/.env.example` → `apps/desktop/.env`

See docs:
- `docs/ARCHITECTURE.md`
- `docs/FIREBASE_SETUP.md`
- `docs/TAURI_SETUP.md`

## Debug: Script Injection Probe
Enable the script probe by adding `?debugScripts=1` to the URL.
