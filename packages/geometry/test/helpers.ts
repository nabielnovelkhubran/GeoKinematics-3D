import { expect } from 'vitest';

export type Vec3Like = { readonly x: number; readonly y: number; readonly z: number };

/** Asserts two numbers are equal to 12 decimal places. */
export const closeTo = (actual: number, expected: number): void => {
  expect(actual).toBeCloseTo(expected, 12);
};

/** Asserts two vectors are component-wise equal to 12 decimal places. */
export const expectVectorCloseTo = (actual: Vec3Like, expected: Vec3Like): void => {
  closeTo(actual.x, expected.x);
  closeTo(actual.y, expected.y);
  closeTo(actual.z, expected.z);
};

/** Raw dot product — independent of the vec3Dot API under test. */
export const dot = (a: Vec3Like, b: Vec3Like): number => a.x * b.x + a.y * b.y + a.z * b.z;

/** Raw cross product — independent of the vec3Cross API under test. */
export const cross = (a: Vec3Like, b: Vec3Like): Vec3Like => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

/** Raw Euclidean length — independent of the vec3Magnitude API under test. */
export const length = (v: Vec3Like): number => Math.hypot(v.x, v.y, v.z);
