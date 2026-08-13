# ADR-005: Domain/UI separation

## Status

Accepted

## Decision

Domain and scientific packages must not depend on React; applications are forbidden imports from package code.

## Consequences

Scientific logic remains portable, testable, and usable by browser or WASM adapters.
