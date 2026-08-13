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
import { closeTo, cross, dot, expectVectorCloseTo, length } from './helpers';

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
