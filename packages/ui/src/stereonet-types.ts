import type { StereonetPoint } from '@geokinematics/domain';

// ── Feature representations ─────────────────────────────────────────────────

/**
 * A plane pole to display on the stereonet.
 * The `id` uniquely identifies the feature for selection and hover callbacks.
 * The `point` is the pre-projected stereonet coordinate produced by
 * \`@geokinematics/geometry\`.
 */
export interface StereonetPole {
  id: string;
  point: StereonetPoint;
}

/**
 * A lineation to display on the stereonet.
 * The `id` uniquely identifies the feature for selection and hover callbacks.
 * The `point` is the pre-projected stereonet coordinate produced by
 * \`@geokinematics/geometry\`.
 */
export interface StereonetLineation {
  id: string;
  point: StereonetPoint;
}

/**
 * A great-circle trace to display on the stereonet.
 * The `id` uniquely identifies the feature for selection and hover callbacks.
 * The `points` are an ordered array of pre-projected stereonet coordinates
 * produced by \`@geokinematics/geometry\`.
 */
export interface StereonetGreatCircle {
  id: string;
  points: StereonetPoint[];
}

// ── Unified feature type ────────────────────────────────────────────────────

/**
 * A discriminated union identifying any single stereonet feature.
 * Feature identity is based on explicit stable IDs, not array indexes.
 *
 * Used as the value type for selection and hover callbacks.
 */
export type StereonetFeature =
  | { type: 'pole'; id: string }
  | { type: 'lineation'; id: string }
  | { type: 'greatCircle'; id: string };

// ── Selection ───────────────────────────────────────────────────────────────

/**
 * The currently selected stereonet feature.
 *
 * Represents a single selected feature. `null` means no selection.
 * Multi-selection is not supported.
 *
 * Controlled selection semantics:
 *
 * - Selecting an unselected feature:  null → feature A
 * - Selecting a different feature:    feature A → feature B
 * - Deselecting the current feature:  feature A → null
 *   (deselect behavior is implemented by the pointer interaction layer,
 *    not by this type definition.)
 */
export type StereonetSelection = StereonetFeature;

// ── Cursor information ──────────────────────────────────────────────────────

/**
 * The geological position of the pointer on the stereonet.
 *
 * `x` and `y` are normalized stereonet coordinates (unit disk, x-East,
 * y-North), produced by the inverse display transform from the SVG pointer
 * position.
 *
 * `trend` and `plunge` are the geological orientation corresponding to that
 * position, derived via the inverse Wulff projection implemented in
 * \`@geokinematics/geometry\`. The UI layer does not perform this calculation.
 *
 * `null` is emitted when the pointer leaves the stereonet boundary.
 */
export interface StereonetCursor {
  /** Normalized stereonet x-coordinate (East positive, range [-1, 1]). */
  x: number;
  /** Normalized stereonet y-coordinate (North positive, range [-1, 1]). */
  y: number;
  /** Geological trend in decimal degrees, clockwise from North [0°, 360°). */
  trend: number;
  /** Geological plunge in decimal degrees, downward from horizontal [0°, 90°]. */
  plunge: number;
}
