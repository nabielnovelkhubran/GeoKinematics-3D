import type {
  Degrees,
  LineOrientation,
  PlaneOrientation,
  StereonetPoint,
  Vector3,
} from '@geokinematics/domain';
import { degreesToRadians, normalizeAzimuth, radiansToDegrees } from './angle';
import { CANONICAL_EPSILON } from './tolerance';
import { vec3Add, vec3Scale, vec3Normalize, vec3Negate } from './vector';
import {
  normalizePlaneOrientation,
  planeStrikeVector,
  planeDownDipVector,
  planeNormalFromOrientation,
} from './plane';

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite.`);
}

function zeroSmallComponents(vector: Vector3): Vector3 {
  return {
    x: Math.abs(vector.x) <= CANONICAL_EPSILON ? 0 : vector.x,
    y: Math.abs(vector.y) <= CANONICAL_EPSILON ? 0 : vector.y,
    z: Math.abs(vector.z) <= CANONICAL_EPSILON ? 0 : vector.z,
  };
}

/**
 * Validates and canonicalizes a geological line orientation.
 * Ensures plunge is in [0°, 90°] and normalizes trend to [0°, 360°).
 */
export function normalizeLineOrientation(orientation: LineOrientation): LineOrientation {
  assertFinite(orientation.plunge, 'Plunge');
  if (orientation.plunge < 0 || orientation.plunge > 90) {
    throw new RangeError('Plunge must be within [0°, 90°].');
  }
  return {
    trend: normalizeAzimuth(orientation.trend),
    plunge: orientation.plunge,
  };
}

/**
 * Converts a geological line orientation to a unit Cartesian vector in the ENU basis.
 */
export function lineVectorFromOrientation(orientation: LineOrientation): Vector3 {
  const { trend, plunge } = normalizeLineOrientation(orientation);
  const trendRad = degreesToRadians(trend);
  const plungeRad = degreesToRadians(plunge);
  return {
    x: Math.sin(trendRad) * Math.cos(plungeRad),
    y: Math.cos(trendRad) * Math.cos(plungeRad),
    z: -Math.sin(plungeRad),
  };
}

/**
 * Converts a unit Cartesian vector to a geological line orientation.
 *
 * @throws {RangeError} if the vector is near-zero or explicitly in the upper hemisphere.
 */
export function lineOrientationFromVector(vector: Vector3): LineOrientation {
  const v = vec3Normalize(vector);
  if (v.z > CANONICAL_EPSILON) {
    throw new RangeError('Vector represents an upper-hemisphere line.');
  }
  const clampedZ = Math.min(0, Math.max(-1, v.z));
  const plungeRaw = radiansToDegrees(Math.asin(-clampedZ));
  const plunge = plungeRaw === 0 ? 0 : plungeRaw;
  const trend = normalizeAzimuth(radiansToDegrees(Math.atan2(v.x, v.y)));
  return { trend, plunge };
}

/**
 * Returns the unit vector in the downward-plunging direction of a line.
 *
 * If the vector has an upward vertical component (z > CANONICAL_EPSILON), it is negated.
 * For horizontal lines (|z| <= CANONICAL_EPSILON), deterministic tie-breaking is applied:
 * prefer x > 0; when x is approximately zero prefer y >= 0.
 *
 * @throws {RangeError} if the vector is near-zero (magnitude <= CANONICAL_EPSILON).
 */
export function selectDownwardDirection(vector: Vector3): Vector3 {
  const normalized = vec3Normalize(vector); // throws for near-zero
  const isUpwardOrNegativeTieBreak =
    normalized.z > CANONICAL_EPSILON ||
    (Math.abs(normalized.z) <= CANONICAL_EPSILON && normalized.x < -CANONICAL_EPSILON) ||
    (Math.abs(normalized.z) <= CANONICAL_EPSILON &&
      Math.abs(normalized.x) <= CANONICAL_EPSILON &&
      normalized.y < 0);
  return zeroSmallComponents(isUpwardOrNegativeTieBreak ? vec3Negate(normalized) : normalized);
}

/**
 * Projects a geological line onto a lower-hemisphere equal-angle stereonet (Wulff net).
 */
export function projectLine(orientation: LineOrientation): StereonetPoint {
  const { trend, plunge } = normalizeLineOrientation(orientation);
  const trendRad = degreesToRadians(trend);
  const plungeRad = degreesToRadians(plunge);

  const r = Math.tan(Math.PI / 4 - plungeRad / 2);

  return {
    x: r * Math.sin(trendRad),
    y: r * Math.cos(trendRad),
  };
}

/**
 * Unprojects a Wulff net stereonet point back into a geological line orientation.
 *
 * @throws {RangeError} if the point lies outside the unit disk beyond tolerance.
 */
export function unprojectLine(point: StereonetPoint): LineOrientation {
  assertFinite(point.x, 'Point X');
  assertFinite(point.y, 'Point Y');

  const r = Math.hypot(point.x, point.y);
  if (r > 1 + CANONICAL_EPSILON) {
    throw new RangeError('Point lies outside the projection disk.');
  }

  if (r <= CANONICAL_EPSILON) {
    return { trend: 0, plunge: 90 };
  }

  const clampedR = Math.min(1, r);
  const plunge = 90 - 2 * radiansToDegrees(Math.atan(clampedR));
  const trend = normalizeAzimuth(radiansToDegrees(Math.atan2(point.x, point.y)));

  return { trend, plunge };
}

/**
 * Projects the pole (normal) of a plane onto the Wulff net.
 */
export function projectPlanePole(orientation: PlaneOrientation): StereonetPoint {
  // Phase 1A ensures the normal is canonicalized to face upward.
  // The pole on a lower-hemisphere stereonet uses the downward-facing equivalent.
  const normal = planeNormalFromOrientation(orientation);
  const downwardNormal = { x: -normal.x, y: -normal.y, z: -normal.z };
  return projectLine(lineOrientationFromVector(downwardNormal));
}

/**
 * Generates points tracing the great-circle projection of a plane on a Wulff net.
 */
export function projectPlaneGreatCircle(
  orientation: PlaneOrientation,
  segments: number = 180,
): readonly StereonetPoint[] {
  if (!Number.isInteger(segments) || segments < 1) {
    throw new RangeError('Segments must be a positive integer.');
  }

  const { dip } = normalizePlaneOrientation(orientation);
  const isHorizontal = Math.abs(dip) <= CANONICAL_EPSILON;

  const S = planeStrikeVector(orientation);
  const D = planeDownDipVector(orientation);

  const points: StereonetPoint[] = [];
  const limit = isHorizontal ? 2 * Math.PI : Math.PI;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * limit;
    const v = vec3Add(vec3Scale(S, Math.cos(theta)), vec3Scale(D, Math.sin(theta)));
    points.push(projectLine(lineOrientationFromVector(v)));
  }

  return points;
}

/**
 * Generates points tracing the small-circle projection of a constant plunge on a Wulff net.
 *
 * @param plunge Geological plunge in decimal degrees [0°, 90°].
 * @param segments Number of angular subdivisions (default 180). Must be a positive integer.
 * @returns An ordered array of pre-projected `StereonetPoint` coordinates forming a closed loop.
 * @throws {RangeError} if plunge is not in [0°, 90°] or segments is not a positive integer.
 */
export function projectSmallCircle(
  plunge: Degrees,
  segments: number = 180,
): readonly StereonetPoint[] {
  assertFinite(plunge, 'Plunge');
  if (plunge < 0 || plunge > 90) {
    throw new RangeError('Plunge must be within [0°, 90°].');
  }
  if (!Number.isInteger(segments) || segments < 1) {
    throw new RangeError('Segments must be a positive integer.');
  }

  const points: StereonetPoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const trend = (i / segments) * 360;
    points.push(projectLine({ trend, plunge }));
  }

  return points;
}
