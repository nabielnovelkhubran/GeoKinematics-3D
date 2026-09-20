# Agent Execution Guidelines

## Context Quality vs. Quantity

### Preserve authoritative project knowledge

Never summarize away or silently replace authoritative project constraints.

Treat the following as high-value context:

- coordinate-system conventions
- orientation and stereonet conventions
- mathematical contracts
- tolerance definitions
- domain/API contracts
- package dependency boundaries
- architecture decisions and ADRs
- current phase specifications
- explicitly documented scientific assumptions

When these are relevant, inspect the authoritative source directly.

### Prefer targeted inspection

For focused tasks:

- Inspect the smallest relevant file or line range first.
- Use `git diff` for localized changes rather than dumping entire files.
- Avoid recursively reading unrelated packages.
- Do not reproduce large unchanged files or logs in model context.

For mathematical or architectural questions, prioritize correctness and authoritative context over token minimization.

### Verification strategy

During iterative development:

- Prefer scoped tests and typechecks relevant to the changed package.
- Avoid repeatedly running the entire workspace verification pipeline for trivial iterations.

Run the full `pnpm verify`:

- before committing a completed phase,
- when changes cross package boundaries,
- when modifying shared infrastructure,
- when modifying build/WASM configuration,
- or whenever integration behavior is uncertain.

### Terminal-output discipline

Do not repeatedly dump large build, test, install, or dependency logs into model context when the command result already provides sufficient information.

Preserve complete output when debugging:

- compiler/type errors,
- failing tests,
- stack traces,
- scientific calculation mismatches,
- runtime failures,
- or other output where omitted lines could change the diagnosis.

### Scientific correctness takes priority

Do not trade mathematical or architectural correctness for token reduction.

If compression, summarization, or scoped inspection creates uncertainty about:

- a formula,
- a boundary condition,
- a coordinate convention,
- a type contract,
- a dependency relationship,
- or a scientific assumption,

inspect the authoritative source again.

### Phase discipline

Keep implementation aligned with the active phase.

Do not introduce future architecture merely because it has been discussed.

Future concepts such as:

- action/preset systems,
- macro chaining,
- node graphs,
- worker orchestration,
- WebGPU execution,

should remain architectural considerations unless the active phase explicitly requires implementation.

### Final verification

Before committing a completed phase:

1. Inspect the final diff.
2. Confirm only intended files changed.
3. Run the appropriate scoped checks.
4. Run `pnpm verify`.
5. Confirm the working tree is clean except for explicitly unrelated local files.

## Documentation standard

All project documentation (README, ADRs, architecture docs, science docs, contributing guides, inline comments) must follow this standard.

### Voice and tone

- Active voice. Technically precise.
- Use domain-specific terms (`canonicalization`, `ENU transform`, `kinematic admissibility`, `serialization overhead`, `numerical tolerance`, `computational boundary`) where they add clarity.
- Do not use technical terms merely to sound sophisticated. If a term would not survive oral defense to a geotechnical engineering professor, replace it.
- Pragmatic, not promotional. Confident about what is built. Honest about what is not.

### Anti-patterns

Do not write:

- "Thank you for your interest in contributing to..."
- "The team takes X seriously"
- "cutting-edge", "state-of-the-art", "seamless", "powerful", "robust"
- Feature-stacking clauses ("combining A, B, C, D, and E")
- Overpromised SLAs for a solo project
- Empty redirects ("See X for more details") when you could state the fact directly

### Developer Notes and Reality Checks

Where useful, include short **Developer Note** or **Reality Check** sections explaining practical engineering reasons behind decisions. Examples:

- Why SVG is used for the stereonet while Three.js handles 3D rendering
- Why pure mathematical functions are kept outside React
- Why Workers are a future execution boundary, not a premature optimization
- Where serialization/transfer overhead becomes significant across WASM or Worker boundaries

### Status discipline

Use three explicit categories:

- **Implemented** — code exists, tested, committed
- **Planned** — design understood, implementation scoped for a near-term phase
- **Architectural Direction** — desired future capability, design not finalized, not scheduled

Never describe an Architectural Direction as if it is Planned or Implemented.
