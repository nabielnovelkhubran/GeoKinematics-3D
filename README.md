# GeoKinematics-3D

GeoKinematics-3D is an open-source, browser-based application for computational rock-slope kinematic analysis. This repository currently contains only the Phase 0.1 tooling and architectural foundation; it deliberately contains no geotechnical calculations.

## Prerequisites

- Node.js 22 or later
- pnpm 11
- Rust stable, with `cargo`, `rustc`, and `rustup` available on `PATH`
- pnpm 11

Install the browser-WASM and E2E prerequisites once after installing Rust:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
pnpm exec playwright install chromium
```

On Windows, Rust normally adds `%USERPROFILE%\.cargo\bin` (for example,
`C:\Users\you\.cargo\bin`) to `PATH`. Restart the terminal after Rust installation
and confirm `cargo --version`, `rustc --version`, and `rustup --version` work.

## Quick start

```sh
pnpm install
pnpm dev
pnpm verify
```

The web shell opens at `http://localhost:3000`, initializes a Three.js canvas, and invokes the generated Rust/WASM boundary. See [CONTRIBUTING.md](CONTRIBUTING.md) for the command reference.
