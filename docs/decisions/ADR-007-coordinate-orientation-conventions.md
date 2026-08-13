# ADR-007: Coordinate and orientation conventions

## Status

Accepted

## Decision

Use a right-handed East-North-Up (ENU) Cartesian frame: `+X` East, `+Y` North,
and `+Z` Up. Distances are metres. Public angular values are decimal degrees;
azimuth is clockwise from North and normalized to `[0°, 360°)`.

Represent planes canonically as down-dip direction and dip. Dip lies in
`[0°, 90°]`. A horizontal plane has undefined dip direction and is represented
as `0°` only for deterministic storage, with no geological directional meaning.

Plane normals are unit vectors canonicalized centrally: prefer `z > 0`; if
`z` is approximately zero, prefer `x > 0`; if `x` is also approximately zero,
prefer `y >= 0`.

## Consequences

The domain package remains renderer-independent. Geometry conversions are
deterministic, including vertical planes where opposite normals otherwise
represent the same plane.
