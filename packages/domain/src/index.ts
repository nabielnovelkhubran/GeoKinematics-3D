/**
 * Framework-independent coordinate and orientation vocabulary.
 *
 * These aliases intentionally remain plain numbers in Phase 1A. Their units
 * are part of the public contract and are validated by package functions.
 */
export type Degrees = number;
export type Radians = number;
export type Metres = number;

/** A minimal Cartesian tuple used for positions, directions, and normals. */
export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * The orientation of a plane, expressed as its downward dip direction and
 * dip angle. Both values are decimal degrees.
 */
export interface PlaneOrientation {
  readonly dipDirection: Degrees;
  readonly dip: Degrees;
}

/**
 * The orientation of a geological line, expressed as its downward plunge
 * and clockwise trend from North. Both values are decimal degrees.
 */
export interface LineOrientation {
  readonly trend: Degrees;
  readonly plunge: Degrees;
}

/**
 * A projected point on a stereonet, typically representing a unit-radius disk.
 */
export interface StereonetPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * The orientation of a slope face, expressed as its downward dip direction and
 * dip angle. Both values are decimal degrees.
 */
export interface SlopeFace {
  readonly dipDirection: Degrees;
  readonly dip: Degrees;
}

/**
 * A friction angle in decimal degrees.
 */
export type FrictionAngle = Degrees;
