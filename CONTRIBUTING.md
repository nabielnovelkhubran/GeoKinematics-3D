# Contributing

Keep scientific logic in `packages/*` and Rust crates. Components in `apps/web` and `packages/ui` may present data but must not own scientific algorithms. Packages must never import from an application.

## Commands

```sh
pnpm install
pnpm dev
pnpm test
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm format:check
pnpm verify
cargo test --workspace
cargo fmt --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
```

## Browser WASM and Playwright setup

The root `dev`, `build`, `test:e2e`, and `verify` commands generate the browser
WASM artifact first. Install their prerequisites once:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --locked
pnpm exec playwright install chromium
```

`cargo`, `rustc`, and `rustup` must be on `PATH`. On Windows, ensure
`%USERPROFILE%\.cargo\bin` is present, then open a new terminal. Generated
wasm-pack files are intentionally ignored; `pnpm wasm:build` writes them to
`apps/web/src/lib/wasm/generated`. The browser smoke test loads that actual
artifact through `apps/web/src/lib/wasm/core.ts` and asserts the Rust-produced
`boundary_probe()` value. Keep that adapter as the only application-facing WASM boundary.
