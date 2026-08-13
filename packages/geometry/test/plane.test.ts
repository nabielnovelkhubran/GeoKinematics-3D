import { describe, expect, it } from 'vitest';
import {
  ENU_BASIS,
  planeContainsDirection,
  planeAreOrthogonal,
  planeAreParallel,
  planeDownDipVector,
  planeFromPointNormal,
  planeIntersectionLine,
  planeNormalFromOrientation,
  planeStrikeVector,
  vec3Magnitude,
  vec3Negate,
} from '../src';
import { closeTo, dot, expectVectorCloseTo } from './helpers';

const ORIGIN = { x: 0, y: 0, z: 0 };
const { east, north, up } = ENU_BASIS;

// ── planeFromPointNormal ────────────────────────────────────────────────────

describe('planeFromPointNormal', () => {
  it('normalizes the supplied normal to unit length', () => {
    const p = planeFromPointNormal(ORIGIN, { x: 0, y: 0, z: 5 });
    closeTo(vec3Magnitude(p.normal), 1);
  });

  it('canonicalizes the normal using the Phase 1A rule (prefer z > 0)', () => {
    // A downward normal should be flipped to upward.
    const p = planeFromPointNormal(ORIGIN, { x: 0, y: 0, z: -1 });
    expectVectorCloseTo(p.normal, up);
  });

  it('preserves the supplied point unchanged', () => {
    const pt = { x: 1, y: 2, z: 3 };
    const p = planeFromPointNormal(pt, up);
    expect(p.point).toEqual(pt);
  });

  it('throws RangeError for a near-zero normal', () => {
    expect(() => planeFromPointNormal(ORIGIN, { x: 0, y: 0, z: 0 })).toThrow(RangeError);
    expect(() => planeFromPointNormal(ORIGIN, { x: 1e-13, y: 0, z: 0 })).toThrow(RangeError);
  });
});

// ── planeAreParallel ────────────────────────────────────────────────────────

describe('planeAreParallel', () => {
  it('returns true for identical planes', () => {
    const a = planeFromPointNormal(ORIGIN, up);
    const b = planeFromPointNormal({ x: 0, y: 0, z: 1 }, up);
    expect(planeAreParallel(a, b)).toBe(true);
  });

  it('returns true for planes whose pre-canonical normals were opposite — parallel plane normals', () => {
    // Both normals canonicalize to the same direction, so the planes are parallel.
    const a = planeFromPointNormal(ORIGIN, up);
    const b = planeFromPointNormal(ORIGIN, vec3Negate(up)); // opposite input, same canonical
    expect(planeAreParallel(a, b)).toBe(true);
  });

  it('returns false for non-parallel planes', () => {
    const horizontal = planeFromPointNormal(ORIGIN, up);
    const vertical = planeFromPointNormal(ORIGIN, east);
    expect(planeAreParallel(horizontal, vertical)).toBe(false);
  });

  it('returns false for oblique planes', () => {
    const a = planeFromPointNormal(
      ORIGIN,
      planeNormalFromOrientation({ dipDirection: 0, dip: 45 }),
    );
    const b = planeFromPointNormal(
      ORIGIN,
      planeNormalFromOrientation({ dipDirection: 90, dip: 45 }),
    );
    expect(planeAreParallel(a, b)).toBe(false);
  });
});

// ── planeAreOrthogonal ──────────────────────────────────────────────────────

describe('planeAreOrthogonal', () => {
  it('returns true for a horizontal and a vertical plane', () => {
    const horizontal = planeFromPointNormal(ORIGIN, up);
    const vertical = planeFromPointNormal(ORIGIN, east);
    expect(planeAreOrthogonal(horizontal, vertical)).toBe(true);
  });

  it('returns true for two perpendicular vertical planes', () => {
    const a = planeFromPointNormal(ORIGIN, east);
    const b = planeFromPointNormal(ORIGIN, north);
    expect(planeAreOrthogonal(a, b)).toBe(true);
  });

  it('returns false for parallel planes', () => {
    const a = planeFromPointNormal(ORIGIN, up);
    const b = planeFromPointNormal(ORIGIN, up);
    expect(planeAreOrthogonal(a, b)).toBe(false);
  });

  it('returns false for non-orthogonal oblique planes', () => {
    const a = planeFromPointNormal(
      ORIGIN,
      planeNormalFromOrientation({ dipDirection: 0, dip: 30 }),
    );
    const b = planeFromPointNormal(
      ORIGIN,
      planeNormalFromOrientation({ dipDirection: 0, dip: 45 }),
    );
    expect(planeAreOrthogonal(a, b)).toBe(false);
  });
});

// ── planeIntersectionLine ───────────────────────────────────────────────────

describe('planeIntersectionLine', () => {
  it('returns a unit vector', () => {
    const a = planeFromPointNormal(ORIGIN, east);
    const b = planeFromPointNormal(ORIGIN, north);
    closeTo(vec3Magnitude(planeIntersectionLine(a, b)), 1);
  });

  it('result is orthogonal to both plane normals', () => {
    const a = planeFromPointNormal(ORIGIN, east);
    const b = planeFromPointNormal(ORIGIN, north);
    const dir = planeIntersectionLine(a, b);
    closeTo(dot(dir, a.normal), 0);
    closeTo(dot(dir, b.normal), 0);
  });

  it('two vertical ENU planes (east-normal × north-normal) intersect along vertical', () => {
    // Plane with east normal (Y-Z plane) ∩ Plane with north normal (X-Z plane)
    // = Z axis (up or down, depending on cross product order)
    const a = planeFromPointNormal(ORIGIN, east);
    const b = planeFromPointNormal(ORIGIN, north);
    const dir = planeIntersectionLine(a, b);
    // The intersection of the two coordinate planes is the Z axis.
    closeTo(Math.abs(dir.z), 1);
    closeTo(dir.x, 0);
    closeTo(dir.y, 0);
  });

  it('result is orthogonal to both normals for an oblique case', () => {
    const n1 = planeNormalFromOrientation({ dipDirection: 45, dip: 60 });
    const n2 = planeNormalFromOrientation({ dipDirection: 135, dip: 30 });
    const a = planeFromPointNormal(ORIGIN, n1);
    const b = planeFromPointNormal(ORIGIN, n2);
    const dir = planeIntersectionLine(a, b);
    closeTo(dot(dir, a.normal), 0);
    closeTo(dot(dir, b.normal), 0);
    closeTo(vec3Magnitude(dir), 1);
  });

  it('throws RangeError for parallel planes', () => {
    const a = planeFromPointNormal(ORIGIN, up);
    const b = planeFromPointNormal({ x: 0, y: 0, z: 5 }, up);
    expect(() => planeIntersectionLine(a, b)).toThrow(RangeError);
  });

  it('throws RangeError when pre-canonical normals were opposite (same plane orientation)', () => {
    const a = planeFromPointNormal(ORIGIN, up);
    const b = planeFromPointNormal(ORIGIN, vec3Negate(up)); // canonicalizes to same as a
    expect(() => planeIntersectionLine(a, b)).toThrow(RangeError);
  });
});

// ── planeContainsDirection ──────────────────────────────────────────────────

describe('planeContainsDirection', () => {
  it('returns true for the strike vector of the plane (lies in the plane)', () => {
    const orientation = { dipDirection: 90, dip: 35 };
    const plane = planeFromPointNormal(ORIGIN, planeNormalFromOrientation(orientation));
    const strike = planeStrikeVector(orientation);
    expect(planeContainsDirection(plane, strike)).toBe(true);
  });

  it('returns true for the down-dip vector (lies in the plane)', () => {
    const orientation = { dipDirection: 45, dip: 60 };
    const plane = planeFromPointNormal(ORIGIN, planeNormalFromOrientation(orientation));
    const downDip = planeDownDipVector(orientation);
    expect(planeContainsDirection(plane, downDip)).toBe(true);
  });

  it('returns false for the plane normal (perpendicular to the plane)', () => {
    const plane = planeFromPointNormal(ORIGIN, up);
    expect(planeContainsDirection(plane, up)).toBe(false);
  });

  it('returns false for an oblique direction not in the plane', () => {
    const plane = planeFromPointNormal(ORIGIN, up); // horizontal plane
    // A direction with a z component is not in the horizontal plane.
    expect(planeContainsDirection(plane, { x: 1, y: 0, z: 1 })).toBe(false);
  });

  it('is scale-invariant: scaled directions give the same result', () => {
    const orientation = { dipDirection: 180, dip: 45 };
    const plane = planeFromPointNormal(ORIGIN, planeNormalFromOrientation(orientation));
    const strike = planeStrikeVector(orientation);
    const scaled = { x: strike.x * 7, y: strike.y * 7, z: strike.z * 7 };
    expect(planeContainsDirection(plane, scaled)).toBe(true);
  });

  it('throws RangeError for a near-zero direction', () => {
    const plane = planeFromPointNormal(ORIGIN, up);
    expect(() => planeContainsDirection(plane, { x: 0, y: 0, z: 0 })).toThrow(RangeError);
  });
});
