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
