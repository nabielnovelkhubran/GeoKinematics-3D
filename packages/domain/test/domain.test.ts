import { describe, expectTypeOf, it } from 'vitest';
import type { Degrees, Metres, PlaneOrientation, Radians, Vector3 } from '../src';

describe('domain coordinate and orientation contract', () => {
  it('keeps scalar units lightweight aliases', () => {
    expectTypeOf<Degrees>().toEqualTypeOf<number>();
    expectTypeOf<Radians>().toEqualTypeOf<number>();
    expectTypeOf<Metres>().toEqualTypeOf<number>();
  });

  it('uses one minimal Cartesian tuple for directions and normals', () => {
    expectTypeOf<Vector3>().toMatchTypeOf<{ x: number; y: number; z: number }>();
    expectTypeOf<PlaneOrientation>().toMatchTypeOf<{ dipDirection: number; dip: number }>();
  });
});
