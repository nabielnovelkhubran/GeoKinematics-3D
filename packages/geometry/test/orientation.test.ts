import { describe, expect, it } from 'vitest';
import {
  CANONICAL_EPSILON,
  ENU_BASIS,
  canonicalizeNormal,
  canonicalizePlaneOrientation,
  normalizeAzimuth,
  normalizePlaneOrientation,
  planeDownDipVector,
  planeNormalFromOrientation,
  planeOrientationFromNormal,
  planeStrikeVector,
} from '../src';

const closeTo = (actual: number, expected: number) => expect(actual).toBeCloseTo(expected, 12);
const expectVectorCloseTo = (
  actual: { x: number; y: number; z: number },
  expected: { x: number; y: number; z: number },
) => {
  closeTo(actual.x, expected.x);
  closeTo(actual.y, expected.y);
  closeTo(actual.z, expected.z);
};
const dot = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) =>
  a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const length = (vector: { x: number; y: number; z: number }) =>
  Math.hypot(vector.x, vector.y, vector.z);

describe('ENU coordinate contract', () => {
  it('defines East, North, and Up basis vectors', () => {
    expect(ENU_BASIS).toEqual({
      east: { x: 1, y: 0, z: 0 },
      north: { x: 0, y: 1, z: 0 },
      up: { x: 0, y: 0, z: 1 },
    });
    expect(cross(ENU_BASIS.east, ENU_BASIS.north)).toEqual(ENU_BASIS.up);
  });
});

describe('orientation contract', () => {
  it('normalizes cardinal azimuth directions', () => {
    expect(normalizeAzimuth(0)).toBe(0);
    expect(normalizeAzimuth(90)).toBe(90);
    expect(normalizeAzimuth(180)).toBe(180);
    expect(normalizeAzimuth(270)).toBe(270);
    expect(normalizeAzimuth(-90)).toBe(270);
    expect(normalizeAzimuth(360)).toBe(0);
    expect(normalizeAzimuth(450)).toBe(90);
  });

  it('accepts only the closed dip interval and validates finite orientations', () => {
    expect(normalizePlaneOrientation({ dipDirection: 90, dip: 0 })).toEqual({
      dipDirection: 0,
      dip: 0,
    });
    expect(normalizePlaneOrientation({ dipDirection: 90, dip: 90 })).toEqual({
      dipDirection: 90,
      dip: 90,
    });
    expect(() => normalizePlaneOrientation({ dipDirection: 0, dip: -Number.EPSILON })).toThrow(
      RangeError,
    );
    expect(() => normalizePlaneOrientation({ dipDirection: 0, dip: 90 + 1 })).toThrow(RangeError);
    expect(() => normalizePlaneOrientation({ dipDirection: Number.NaN, dip: 45 })).toThrow(
      RangeError,
    );
  });

  it('maps cardinal dip directions to down-dip vectors', () => {
    const horizontal = Math.SQRT1_2;
    expectVectorCloseTo(planeDownDipVector({ dipDirection: 0, dip: 45 }), {
      x: 0,
      y: horizontal,
      z: -horizontal,
    });
    expectVectorCloseTo(planeDownDipVector({ dipDirection: 90, dip: 45 }), {
      x: horizontal,
      y: 0,
      z: -horizontal,
    });
    expectVectorCloseTo(planeDownDipVector({ dipDirection: 180, dip: 45 }), {
      x: 0,
      y: -horizontal,
      z: -horizontal,
    });
    expectVectorCloseTo(planeDownDipVector({ dipDirection: 270, dip: 45 }), {
      x: -horizontal,
      y: 0,
      z: -horizontal,
    });
  });

  it('keeps normal orthogonal to down-dip and strike vectors', () => {
    const orientation = { dipDirection: 90, dip: 35 };
    const normal = planeNormalFromOrientation(orientation);
    closeTo(dot(normal, planeDownDipVector(orientation)), 0);
    closeTo(dot(normal, planeStrikeVector(orientation)), 0);
  });

  it('returns unit normals within the documented tolerance', () => {
    closeTo(length(planeNormalFromOrientation({ dipDirection: 123, dip: 47 })), 1);
    closeTo(length(canonicalizeNormal({ x: 3, y: -4, z: 12 })), 1);
  });

  it('canonicalizes vertical normals with the z, x, y tie-break', () => {
    expect(canonicalizeNormal({ x: -1, y: 0, z: 0 })).toEqual({ x: 1, y: 0, z: 0 });
    expect(canonicalizeNormal({ x: 0, y: -1, z: 0 })).toEqual({ x: 0, y: 1, z: 0 });
    expect(canonicalizePlaneOrientation({ dipDirection: 270, dip: 90 })).toEqual({
      dipDirection: 90,
      dip: 90,
    });
  });

  it('canonicalizes the undefined horizontal dip direction to 0 degrees', () => {
    expect(canonicalizePlaneOrientation({ dipDirection: 225, dip: 0 })).toEqual({
      dipDirection: 0,
      dip: 0,
    });
    expect(planeOrientationFromNormal({ x: 0, y: 0, z: -2 })).toEqual({ dipDirection: 0, dip: 0 });
  });

  it('round-trips non-horizontal, non-vertical orientations and canonicalizes vertical planes', () => {
    const oblique = { dipDirection: 135, dip: 45 };
    const recovered = planeOrientationFromNormal(planeNormalFromOrientation(oblique));
    closeTo(recovered.dipDirection, oblique.dipDirection);
    closeTo(recovered.dip, oblique.dip);

    expect(
      planeOrientationFromNormal(planeNormalFromOrientation({ dipDirection: 270, dip: 90 })),
    ).toEqual({
      dipDirection: 90,
      dip: 90,
    });
  });

  it('uses a small documented tolerance for canonicalization', () => {
    expect(CANONICAL_EPSILON).toBeGreaterThan(0);
  });
});
