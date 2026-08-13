import type { Degrees, PlaneOrientation, Radians, Vector3 } from '@geokinematics/domain';

/** Numerical tolerance used by deterministic normal canonicalization. */
export const CANONICAL_EPSILON = 1e-12;

/** Right-handed East-North-Up basis for all Phase 1A geometry. */
export const ENU_BASIS = {
  east: { x: 1, y: 0, z: 0 },
  north: { x: 0, y: 1, z: 0 },
  up: { x: 0, y: 0, z: 1 },
} as const satisfies Record<'east' | 'north' | 'up', Vector3>;

const FULL_CIRCLE_DEGREES = 360;
const RIGHT_ANGLE_DEGREES = 90;

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite.`);
}

function magnitude(vector: Vector3): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function unit(vector: Vector3): Vector3 {
  const length = magnitude(vector);
  if (length <= CANONICAL_EPSILON) throw new RangeError('A normal must be non-zero.');
  return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

function negate(vector: Vector3): Vector3 {
  return { x: -vector.x, y: -vector.y, z: -vector.z };
}

function zeroSmallComponents(vector: Vector3): Vector3 {
  return {
    x: Math.abs(vector.x) <= CANONICAL_EPSILON ? 0 : vector.x,
    y: Math.abs(vector.y) <= CANONICAL_EPSILON ? 0 : vector.y,
    z: Math.abs(vector.z) <= CANONICAL_EPSILON ? 0 : vector.z,
  };
}

/** Converts decimal degrees to radians. */
export function degreesToRadians(degrees: Degrees): Radians {
  assertFinite(degrees, 'Degrees');
  return (degrees * Math.PI) / 180;
}

/** Converts radians to decimal degrees. */
export function radiansToDegrees(radians: Radians): Degrees {
  assertFinite(radians, 'Radians');
  return (radians * 180) / Math.PI;
}

/** Normalizes a clockwise-from-north azimuth to the half-open interval [0°, 360°). */
export function normalizeAzimuth(azimuth: Degrees): Degrees {
  assertFinite(azimuth, 'Azimuth');
  const normalized = ((azimuth % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES;
  return normalized === FULL_CIRCLE_DEGREES ? 0 : normalized;
}

/**
 * Validates and canonicalizes a plane orientation.
 *
 * A horizontal plane has undefined dip direction; it is represented as 0°
 * solely for deterministic storage and has no geological directional meaning.
 */
export function normalizePlaneOrientation(orientation: PlaneOrientation): PlaneOrientation {
  assertFinite(orientation.dip, 'Dip');
  if (orientation.dip < 0 || orientation.dip > RIGHT_ANGLE_DEGREES) {
    throw new RangeError('Dip must be within [0°, 90°].');
  }

  const dipDirection = normalizeAzimuth(orientation.dipDirection);
  if (Math.abs(orientation.dip) <= CANONICAL_EPSILON) return { dipDirection: 0, dip: 0 };
  return { dipDirection, dip: orientation.dip };
}

/**
 * Returns the deterministic representative of an unoriented plane normal.
 * Prefer z > 0; when z is approximately zero prefer x > 0; when x is also
 * approximately zero prefer y >= 0. This makes vertical-plane handling stable.
 */
export function canonicalizeNormal(normal: Vector3): Vector3 {
  const normalized = unit(normal);
  const isNegativeHemisphere =
    normalized.z < -CANONICAL_EPSILON ||
    (Math.abs(normalized.z) <= CANONICAL_EPSILON && normalized.x < -CANONICAL_EPSILON) ||
    (Math.abs(normalized.z) <= CANONICAL_EPSILON &&
      Math.abs(normalized.x) <= CANONICAL_EPSILON &&
      normalized.y < 0);
  return zeroSmallComponents(isNegativeHemisphere ? negate(normalized) : normalized);
}

/** Returns the horizontal strike vector using the right-hand relation with the down-dip vector. */
export function planeStrikeVector(orientation: PlaneOrientation): Vector3 {
  const { dipDirection } = normalizePlaneOrientation(orientation);
  const azimuth = degreesToRadians(dipDirection);
  return { x: -Math.cos(azimuth), y: Math.sin(azimuth), z: 0 };
}

/** Returns the unit vector pointing down the plane in its dip-direction. */
export function planeDownDipVector(orientation: PlaneOrientation): Vector3 {
  const { dipDirection, dip } = normalizePlaneOrientation(orientation);
  const azimuth = degreesToRadians(dipDirection);
  const dipRadians = degreesToRadians(dip);
  return {
    x: Math.sin(azimuth) * Math.cos(dipRadians),
    y: Math.cos(azimuth) * Math.cos(dipRadians),
    z: -Math.sin(dipRadians),
  };
}

/** Returns the upward-canonical unit normal derived from dip direction and dip. */
export function planeNormalFromOrientation(orientation: PlaneOrientation): Vector3 {
  const { dipDirection, dip } = normalizePlaneOrientation(orientation);
  const azimuth = degreesToRadians(dipDirection);
  const dipRadians = degreesToRadians(dip);
  return canonicalizeNormal({
    x: Math.sin(dipRadians) * Math.sin(azimuth),
    y: Math.sin(dipRadians) * Math.cos(azimuth),
    z: Math.cos(dipRadians),
  });
}

/**
 * Derives the canonical dip-direction/dip representation from a plane normal.
 * For a horizontal plane, dip direction is returned as 0° for deterministic
 * representation only; it has no geological directional meaning.
 */
export function planeOrientationFromNormal(normal: Vector3): PlaneOrientation {
  const canonical = canonicalizeNormal(normal);
  const dip = radiansToDegrees(Math.acos(Math.min(1, Math.max(-1, canonical.z))));
  if (dip <= CANONICAL_EPSILON) return { dipDirection: 0, dip: 0 };
  return {
    dipDirection: normalizeAzimuth(radiansToDegrees(Math.atan2(canonical.x, canonical.y))),
    dip,
  };
}

/** Converts an arbitrary orientation to its deterministic plane representation. */
export function canonicalizePlaneOrientation(orientation: PlaneOrientation): PlaneOrientation {
  return planeOrientationFromNormal(planeNormalFromOrientation(orientation));
}
