# Coordinate and orientation conventions

Phase 1A establishes only the shared coordinate/orientation contract; it does
not perform kinematic or stability analysis.

## Coordinate frame

The project uses a right-handed ENU frame:

- `+X`: East
- `+Y`: North
- `+Z`: Up

Thus East × North = Up. Distances are metres.

## Plane orientation

A plane is represented by decimal-degree `dipDirection` and `dip`:

- dip direction is clockwise from North, normalized to `[0°, 360°)`;
- dip is downward from horizontal, constrained to `[0°, 90°]`.

The down-dip unit vector for azimuth `a` and dip `d` is:

```text
(sin(a) cos(d), cos(a) cos(d), -sin(d))
```

The canonical normal is a unit vector with deterministic sign selection:
prefer positive `z`; when `z` is approximately zero, prefer positive `x`; when
both are approximately zero, prefer non-negative `y`.

Horizontal planes have no mathematical dip direction. They are stored as
`dipDirection: 0` only to make serialization and equality deterministic; that
value has no geological directional meaning.
