# ADR-003: Rust/WASM

## Status

Accepted

## Decision

Use Rust compiled to WebAssembly for selected performance-sensitive computational kernels.

## Consequences

`geokinematics-core` exposes a narrow, generated browser contract. Bindings are generated locally and not committed.
