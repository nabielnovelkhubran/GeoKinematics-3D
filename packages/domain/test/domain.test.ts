import { describe, expectTypeOf, it } from 'vitest';
import type {
  Degrees,
  FrictionAngle,
  Metres,
  PlaneOrientation,
  Radians,
  SlopeFace,
  Vector3,
} from '../src';

describe('domain coordinate and orientation contract', () => {
  it('keeps scalar units lightweight aliases', () => {
    expectTypeOf<Degrees>().toEqualTypeOf<number>();
    expectTypeOf<Radians>().toEqualTypeOf<number>();
    expectTypeOf<Metres>().toEqualTypeOf<number>();
    expectTypeOf<FrictionAngle>().toEqualTypeOf<number>();
  });

  it('uses one minimal Cartesian tuple for directions and normals', () => {
    expectTypeOf<Vector3>().toMatchTypeOf<{ x: number; y: number; z: number }>();
    expectTypeOf<PlaneOrientation>().toMatchTypeOf<{ dipDirection: number; dip: number }>();
    expectTypeOf<SlopeFace>().toMatchTypeOf<{ dipDirection: number; dip: number }>();
  });
});
