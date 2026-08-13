# Decisions

The current implementation follows the accepted records in `docs/decisions`:

- React and Next.js for the browser shell.
- Three.js for GPU-backed scene rendering.
- Rust compiled to WebAssembly for selected computational kernels.
- Local-first operation without a backend in this phase.
- A strict domain/UI separation.
- Deterministic calculations as a foundational property.
- ENU coordinate and orientation conventions for framework-independent geometry.
