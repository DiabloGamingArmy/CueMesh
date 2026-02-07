# Tauri Desktop Setup

## Prerequisites
- Rust toolchain (`rustup` + `cargo`)
- System dependencies for Tauri (see the official Tauri docs for Windows requirements)

## Development
1. Install dependencies: `pnpm install`
2. Start desktop dev: `pnpm dev:desktop`

The desktop app runs the same Vite UI and connects to Firebase using the same `.env` values.

## Build (Windows)
- `pnpm build:desktop`

The JS → native bridge is available in the UI via `window.__CUEMESH_NATIVE__` and supports:
- `native.playAudio(pathOrAssetId)` (stubbed)
- `native.registerHotkeys(map)` (stubbed)
