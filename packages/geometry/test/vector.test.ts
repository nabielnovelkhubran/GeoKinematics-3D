import { describe, expect, it } from 'vitest';
import {
  ENU_BASIS,
  vec3Add,
  vec3AngleBetween,
  vec3AreParallel,
  vec3Cross,
  vec3Dot,
  vec3IsUnit,
  vec3Magnitude,
  vec3Negate,
  vec3Normalize,
  vec3Scale,
  vec3Sub,
} from '../src';
import { closeTo, cross, dot, expectVectorCloseTo, length } from './helpers';

const ZERO = { x: 0, y: 0, z: 0 };
const { east, north, up } = ENU_BASIS;
const OBLIQUE = { x: 3, y: -4, z: 12 };

describe('vec3Magnitude', () => {
  it('returns the Euclidean length', () => {
    closeTo(vec3Magnitude(east), 1);
    closeTo(vec3Magnitude({ x: 3, y: 4, z: 0 }), 5);
    closeTo(vec3Magnitude(ZERO), 0);
  });
});

describe('vec3Normalize', () => {
  it('returns a unit vector', () => {
    closeTo(vec3Magnitude(vec3Normalize(OBLIQUE)), 1);
    closeTo(vec3Magnitude(vec3Normalize(east)), 1);
  });

  it('throws RangeError for a near-zero vector', () => {
    expect(() => vec3Normalize(ZERO)).toThrow(RangeError);
    expect(() => vec3Normalize({ x: 0, y: 0, z: 0 })).toThrow(RangeError);
  });
});

describe('vec3Negate', () => {
  it('negates every component', () => {
    expectVectorCloseTo(vec3Negate(east), { x: -1, y: 0, z: 0 });
    expectVectorCloseTo(vec3Negate(OBLIQUE), { x: -3, y: 4, z: -12 });
  });
});

describe('vec3Add and vec3Sub', () => {
  it('satisfies a + (-a) = zero', () => {
    expectVectorCloseTo(vec3Add(east, vec3Negate(east)), ZERO);
  });

  it('satisfies a - b = a + (-b)', () => {
    const a = { x: 1, y: 2, z: 3 };
    const b = { x: 4, y: -1, z: 2 };
    expectVectorCloseTo(vec3Sub(a, b), vec3Add(a, vec3Negate(b)));
  });
});

describe('vec3Scale', () => {
  it('scales each component', () => {
    expectVectorCloseTo(vec3Scale(east, 3), { x: 3, y: 0, z: 0 });
    expectVectorCloseTo(vec3Scale(north, 0), ZERO);
  });
});

describe('vec3Dot', () => {
  it('agrees with the raw reference implementation', () => {
    const a = { x: 1, y: 2, z: 3 };
    const b = { x: -1, y: 4, z: 2 };
    closeTo(vec3Dot(a, b), dot(a, b));
  });

  it('ENU basis vectors are mutually orthogonal', () => {
    closeTo(vec3Dot(east, north), 0);
    closeTo(vec3Dot(north, up), 0);
    closeTo(vec3Dot(east, up), 0);
  });

  it('ENU basis self-dot equals 1', () => {
    closeTo(vec3Dot(east, east), 1);
    closeTo(vec3Dot(north, north), 1);
    closeTo(vec3Dot(up, up), 1);
  });
});

describe('vec3Cross', () => {
  it('agrees with the raw reference implementation', () => {
    const a = { x: 1, y: 2, z: 3 };
    const b = { x: 4, y: -1, z: 2 };
    expectVectorCloseTo(vec3Cross(a, b), cross(a, b));
  });

  it('east × north = up (ENU right-hand contract)', () => {
    expectVectorCloseTo(vec3Cross(east, north), up);
  });

  it('is anti-commutative: a × b = -(b × a)', () => {
    const a = { x: 1, y: 2, z: 3 };
    const b = { x: 4, y: -1, z: 2 };
    expectVectorCloseTo(vec3Cross(a, b), vec3Negate(vec3Cross(b, a)));
  });

  it('result is orthogonal to both operands', () => {
    const a = { x: 2, y: 1, z: 0 };
    const b = { x: 0, y: 3, z: -1 };
    const c = vec3Cross(a, b);
    closeTo(dot(a, c), 0);
    closeTo(dot(b, c), 0);
  });
});

describe('vec3IsUnit', () => {
  it('accepts ENU basis vectors', () => {
    expect(vec3IsUnit(east)).toBe(true);
    expect(vec3IsUnit(north)).toBe(true);
    expect(vec3IsUnit(up)).toBe(true);
  });

  it('accepts a freshly normalized vector', () => {
    expect(vec3IsUnit(vec3Normalize(OBLIQUE))).toBe(true);
  });

  it('rejects non-unit vectors', () => {
    expect(vec3IsUnit({ x: 2, y: 0, z: 0 })).toBe(false);
    expect(vec3IsUnit(ZERO)).toBe(false);
    expect(vec3IsUnit({ x: 0.5, y: 0, z: 0 })).toBe(false);
  });
});

describe('vec3AreParallel', () => {
  it('returns true for parallel vectors', () => {
    expect(vec3AreParallel(east, { x: 5, y: 0, z: 0 })).toBe(true);
    expect(vec3AreParallel(north, north)).toBe(true);
  });

  it('returns true for anti-parallel (opposite) vectors', () => {
    expect(vec3AreParallel(east, vec3Negate(east))).toBe(true);
    expect(vec3AreParallel(up, { x: 0, y: 0, z: -7 })).toBe(true);
  });

  it('returns false for non-parallel vectors', () => {
    expect(vec3AreParallel(east, north)).toBe(false);
    expect(vec3AreParallel(east, up)).toBe(false);
    expect(vec3AreParallel({ x: 1, y: 1, z: 0 }, east)).toBe(false);
  });

  it('returns false if either input is near-zero', () => {
    expect(vec3AreParallel(ZERO, east)).toBe(false);
    expect(vec3AreParallel(east, ZERO)).toBe(false);
    expect(vec3AreParallel(ZERO, ZERO)).toBe(false);
  });
});

describe('vec3AngleBetween', () => {
  it('returns 0 for a vector with itself', () => {
    closeTo(vec3AngleBetween(east, east), 0);
    closeTo(vec3AngleBetween(OBLIQUE, OBLIQUE), 0);
  });

  it('returns π/2 for perpendicular ENU basis pairs', () => {
    closeTo(vec3AngleBetween(east, north), Math.PI / 2);
    closeTo(vec3AngleBetween(north, up), Math.PI / 2);
  });

  it('returns π for opposite vectors', () => {
    closeTo(vec3AngleBetween(east, vec3Negate(east)), Math.PI);
    closeTo(vec3AngleBetween(up, vec3Negate(up)), Math.PI);
  });

  it('is scale-invariant', () => {
    const a = { x: 3, y: 0, z: 0 };
    const b = { x: 0, y: 7, z: 0 };
    closeTo(vec3AngleBetween(a, b), Math.PI / 2);
  });

  it('throws RangeError if either input is near-zero', () => {
    expect(() => vec3AngleBetween(ZERO, east)).toThrow(RangeError);
    expect(() => vec3AngleBetween(east, ZERO)).toThrow(RangeError);
    expect(() => vec3AngleBetween(ZERO, ZERO)).toThrow(RangeError);
  });

  it('the result magnitude equals the raw reference for an oblique pair', () => {
    const a = { x: 1, y: 1, z: 0 };
    const b = { x: 1, y: 0, z: 1 };
    const angle = vec3AngleBetween(a, b);
    const expectedCos = dot(a, b) / (length(a) * length(b));
    closeTo(Math.cos(angle), expectedCos);
  });
});
