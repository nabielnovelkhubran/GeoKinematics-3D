# ADR-008: Stereonet projection convention

## Status

Accepted

## Decision

GeoKinematics-3D uses a lower-hemisphere equal-angle stereographic projection (Wulff net) as its initial stereonet convention.

Geological lines are represented by their downward-positive plunge `[0°, 90°]` and clockwise trend from North `[0°, 360°)`.

The stereonet Cartesian coordinate system uses:

- `+X` = East
- `+Y` = North

The center of the projection `(0, 0)` represents a vertical downward line.
The circumference (rim) of the projection represents horizontal lines.

Projection coordinates are normalized to a unit-radius disk.
Equal-area (Schmidt) projection is explicitly out of scope for Phase 1C and may be introduced later as a secondary projection strategy.

## Consequences

The projection functions guarantee that points lie inside or on the unit disk (within tolerance). Lines in the upper hemisphere must be properly canonicalized (or rejected depending on geological semantics) when projected. The canonical upward-facing plane normals from Phase 1A must be flipped to their downward-facing equivalents prior to plotting their poles in the lower hemisphere.
