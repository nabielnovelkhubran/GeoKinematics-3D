import React from 'react';
import type { StereonetPoint } from '@geokinematics/domain';
import type {
  StereonetCursor,
  StereonetFeature,
  StereonetGreatCircle,
  StereonetLineation,
  StereonetPole,
  StereonetSelection,
} from './stereonet-types';

export interface StereonetProps {
  /** SVG canvas size in pixels. Defaults to 400. */
  size?: number;
  /**
   * Interval in degrees between Wulff grid lines.
   * Must be a divisor of 90. Defaults to 10.
   */
  gridInterval?: number;
  /** Whether to render the Wulff/equal-angle grid. Defaults to true. */
  showGrid?: boolean;
  /** Whether to render the N/E/S/W cardinal and degree labels. Defaults to true. */
  showLabels?: boolean;
  /** Pre-projected lineation features to plot as filled circles. */
  lineations?: StereonetLineation[];
  /** Pre-projected pole features to plot as filled squares. */
  poles?: StereonetPole[];
  /**
   * Pre-projected great-circle features. Each entry carries a stable id and
   * an ordered array of StereonetPoint values defining one great-circle trace.
   */
  greatCircles?: StereonetGreatCircle[];

  // ── Interaction contract ────────────────────────────────────────────────

  /**
   * The currently selected feature, or `null` for no selection.
   * Controlled prop — the parent is responsible for state management.
   *
   * Selection semantics:
   *   - Selecting an unselected feature:      null → feature A
   *   - Selecting a different feature:        feature A → feature B
   *   - Deselecting the current feature:      feature A → null
   *     (deselect behavior is implemented by the pointer interaction layer.)
   */
  selection?: StereonetSelection | null;

  /**
   * Called when the user selects or deselects a feature.
   * Receives the newly selected feature, or `null` when deselected.
   * Pointer interaction is not yet implemented; this prop defines the contract.
   */
  onSelectionChange?: (selection: StereonetSelection | null) => void;

  /**
   * Called when the pointer enters or leaves a feature.
   * Receives the hovered feature, or `null` when leaving a feature.
   * Pointer interaction is not yet implemented; this prop defines the contract.
   */
  onHover?: (feature: StereonetFeature | null) => void;

  /**
   * Called as the pointer moves across the stereonet surface.
   * Receives the current normalized stereonet coordinate and its geological
   * orientation (via inverse Wulff projection in \`@geokinematics/geometry\`),
   * or `null` when the pointer leaves the stereonet boundary.
   * Pointer interaction is not yet implemented; this prop defines the contract.
   */
  onCursorMove?: (cursor: StereonetCursor | null) => void;
}

/**
 * Applies the visualization-only linear transform from stereonet coordinates
 * (unit disk, x-East, y-North) to SVG pixel coordinates.
 *
 * svgX = center + stereonetX * radius
 * svgY = center - stereonetY * radius
 */
function toSvg(p: StereonetPoint, center: number, radius: number): { x: number; y: number } {
  return {
    x: center + p.x * radius,
    y: center - p.y * radius,
  };
}

function fmt(n: number): string {
  return n.toFixed(4);
}

/**
 * Reusable SVG stereonet visualization component.
 *
 * Accepts already-projected StereonetPoint data (produced by
 * @geokinematics/geometry) and renders them onto an equal-angle Wulff net.
 * No projection mathematics are performed here.
 */
export function Stereonet({
  size = 400,
  gridInterval = 10,
  showGrid = true,
  showLabels = true,
  lineations = [],
  poles = [],
  greatCircles = [],
}: StereonetProps): React.ReactElement {
  const labelPad = showLabels ? 24 : 10;
  const radius = (size - labelPad * 2) / 2;
  const center = size / 2;

  // ── Wulff grid ──────────────────────────────────────────────────────────────
  // The Wulff net consists of:
  //   Meridians – great circles connecting N and S through varying azimuths.
  //   Parallels – small circles at constant dip angles.
  // Both families are rendered as SVG arc paths derived from their
  // geometric radii and centre offsets, not from stereonet projection calls.

  const gridLines: React.ReactNode[] = [];

  if (showGrid && gridInterval > 0 && gridInterval < 90) {
    // N–S axis and E–W axis
    gridLines.push(
      <line
        key="axis-ns"
        x1={fmt(center)}
        y1={fmt(center - radius)}
        x2={fmt(center)}
        y2={fmt(center + radius)}
        stroke="#d0d0d0"
        strokeWidth={0.75}
      />,
      <line
        key="axis-ew"
        x1={fmt(center - radius)}
        y1={fmt(center)}
        x2={fmt(center + radius)}
        y2={fmt(center)}
        stroke="#d0d0d0"
        strokeWidth={0.75}
      />,
    );

    for (let deg = gridInterval; deg < 90; deg += gridInterval) {
      const rad = (deg * Math.PI) / 180;

      // ── Meridians ────────────────────────────────────────────────────────
      // A Wulff meridian at angle `deg` from N–S has its arc radius = R/sin(deg)
      // and is centred on the E–W axis at offset ±R/tan(deg) from centre.
      const mArcR = radius / Math.sin(rad);
      const mOffset = radius / Math.tan(rad);

      // Eastern meridian (curves through E half)
      const mEcx = fmt(center + mOffset);
      const mArcRf = fmt(mArcR);
      const Ny = fmt(center - radius);
      const Sy = fmt(center + radius);
      const cx = fmt(center);

      gridLines.push(
        <path
          key={`mer-e-${deg}`}
          d={`M ${cx} ${Ny} A ${mArcRf} ${mArcRf} 0 0 1 ${cx} ${Sy}`}
          fill="none"
          stroke="#d0d0d0"
          strokeWidth={0.75}
          transform={`rotate(0, ${cx}, ${fmt(center)})`}
          // Use the circle centred at (center+mOffset, center) passing through N and S
          data-wulff-meridian={deg}
        />,
      );
      // Derive the arc using the actual centre offset trick with a dummy transform:
      // Recompute with explicit endpoints and the correct arc centre.
      // SVG A command: `A rx ry x-rotation large-arc-flag sweep-flag x y`
      // The meridian arc passes through N(center, center-R) and S(center, center+R),
      // centred at (center ± R/tan(deg), center).
      gridLines.pop(); // remove placeholder above
      gridLines.push(
        <path
          key={`mer-e-${deg}`}
          d={`M ${fmt(center)} ${fmt(center - radius)} A ${fmt(mArcR)} ${fmt(mArcR)} 0 0 1 ${fmt(center)} ${fmt(center + radius)}`}
          fill="none"
          stroke="#d0d0d0"
          strokeWidth={0.75}
        />,
        <path
          key={`mer-w-${deg}`}
          d={`M ${fmt(center)} ${fmt(center - radius)} A ${fmt(mArcR)} ${fmt(mArcR)} 0 0 0 ${fmt(center)} ${fmt(center + radius)}`}
          fill="none"
          stroke="#d0d0d0"
          strokeWidth={0.75}
        />,
      );

      // ── Parallels ────────────────────────────────────────────────────────
      // A Wulff parallel at dip angle `deg` from horizontal has:
      //   arc radius = R/cos(deg)
      //   end-points at (±R·sin(deg), 0) relative to centre
      //   centred at (0, ±R/tan(deg)) — but we use horizontal arcs:
      //   The parallel sits at y = ±R·sin(deg) from centre (no — Wulff parallels
      //   are arcs of circles, not horizontal lines).
      //
      // In the Wulff projection, the small circle at dip `d` from the primitive
      // is an arc of radius r = R·tan(90°-d/2)·… Actually the standard formula:
      //   The parallel at angular distance `deg` from N on the stereonet is an arc
      //   of a circle with:
      //     cx = center,   cy = center ± R/sin(deg)   [two arcs, one above, one below]
      //     arc radius = R/sin(deg)
      //   connecting from W-point to E-point at that latitude.
      //
      // W-point: x = center - R·cos(deg), y = center
      // E-point: x = center + R·cos(deg), y = center
      // Upper arc centre: (center, center - R/sin(deg))
      // Lower arc centre: (center, center + R/sin(deg))
      const pArcR = radius / Math.sin(rad);
      const pHalfWidth = radius * Math.cos(rad);

      const pWx = fmt(center - pHalfWidth);
      const pEx = fmt(center + pHalfWidth);
      const pArcRf2 = fmt(pArcR);
      const cy = fmt(center);

      // Northern parallel (upper half, arc bulges upward)
      gridLines.push(
        <path
          key={`par-n-${deg}`}
          d={`M ${pWx} ${cy} A ${pArcRf2} ${pArcRf2} 0 0 1 ${pEx} ${cy}`}
          fill="none"
          stroke="#d0d0d0"
          strokeWidth={0.75}
        />,
      );
      // Southern parallel (lower half, arc bulges downward)
      gridLines.push(
        <path
          key={`par-s-${deg}`}
          d={`M ${pWx} ${cy} A ${pArcRf2} ${pArcRf2} 0 0 0 ${pEx} ${cy}`}
          fill="none"
          stroke="#d0d0d0"
          strokeWidth={0.75}
        />,
      );
    }
  } else if (showGrid) {
    // gridInterval === 0 or ≥ 90: just render the two axes
    gridLines.push(
      <line
        key="axis-ns"
        x1={fmt(center)}
        y1={fmt(center - radius)}
        x2={fmt(center)}
        y2={fmt(center + radius)}
        stroke="#d0d0d0"
        strokeWidth={0.75}
      />,
      <line
        key="axis-ew"
        x1={fmt(center - radius)}
        y1={fmt(center)}
        x2={fmt(center + radius)}
        y2={fmt(center)}
        stroke="#d0d0d0"
        strokeWidth={0.75}
      />,
    );
  }

  // ── Great circles ────────────────────────────────────────────────────────────
  const gcPaths = greatCircles.map((gc) => {
    if (gc.points.length === 0) return null;
    const d = gc.points
      .map((p, j) => {
        const pt = toSvg(p, center, radius);
        return `${j === 0 ? 'M' : 'L'} ${fmt(pt.x)} ${fmt(pt.y)}`;
      })
      .join(' ');
    return <path key={gc.id} d={d} fill="none" stroke="#cc2200" strokeWidth={1.5} />;
  });

  // ── Lineation markers ────────────────────────────────────────────────────────
  const lineationMarkers = lineations.map((lineation) => {
    const pt = toSvg(lineation.point, center, radius);
    return (
      <circle
        key={lineation.id}
        cx={fmt(pt.x)}
        cy={fmt(pt.y)}
        r={4}
        fill="#1a56db"
        stroke="#fff"
        strokeWidth={0.75}
      />
    );
  });

  // ── Pole markers ─────────────────────────────────────────────────────────────
  const poleMarkers = poles.map((pole) => {
    const pt = toSvg(pole.point, center, radius);
    const half = 4;
    return (
      <rect
        key={pole.id}
        x={fmt(pt.x - half)}
        y={fmt(pt.y - half)}
        width={half * 2}
        height={half * 2}
        fill="#15803d"
        stroke="#fff"
        strokeWidth={0.75}
      />
    );
  });

  // ── Cardinal labels ──────────────────────────────────────────────────────────
  const labelOffset = 14;
  const degLabelOffset = 12;
  const cardinalFontSize = 13;
  const degFontSize = 9;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="stereonet">
      {/* Primitive circle background */}
      <circle
        data-testid="primitive-circle"
        cx={fmt(center)}
        cy={fmt(center)}
        r={fmt(radius)}
        fill="#fafafa"
        stroke="#333"
        strokeWidth={1.5}
      />

      {/* Wulff grid */}
      {showGrid && <g data-testid="stereonet-grid">{gridLines}</g>}

      {/* Great circle paths */}
      <g data-testid="great-circles">{gcPaths}</g>

      {/* Lineations */}
      <g data-testid="lineations">{lineationMarkers}</g>

      {/* Poles */}
      <g data-testid="poles">{poleMarkers}</g>

      {/* Cardinal and degree labels */}
      {showLabels && (
        <g data-testid="stereonet-labels" fontFamily="system-ui, sans-serif" fill="#333">
          {/* N */}
          <text
            x={fmt(center)}
            y={fmt(center - radius - labelOffset)}
            fontSize={cardinalFontSize}
            textAnchor="middle"
            dominantBaseline="auto"
            fontWeight="600"
          >
            N
          </text>
          <text
            x={fmt(center)}
            y={fmt(center - radius - degLabelOffset + cardinalFontSize + 2)}
            fontSize={degFontSize}
            textAnchor="middle"
            dominantBaseline="auto"
            fill="#666"
          >
            000°
          </text>

          {/* E */}
          <text
            x={fmt(center + radius + labelOffset)}
            y={fmt(center)}
            fontSize={cardinalFontSize}
            textAnchor="start"
            dominantBaseline="middle"
            fontWeight="600"
          >
            E
          </text>
          <text
            x={fmt(center + radius + labelOffset + cardinalFontSize + 2)}
            y={fmt(center)}
            fontSize={degFontSize}
            textAnchor="start"
            dominantBaseline="middle"
            fill="#666"
          >
            090°
          </text>

          {/* S */}
          <text
            x={fmt(center)}
            y={fmt(center + radius + labelOffset + cardinalFontSize)}
            fontSize={cardinalFontSize}
            textAnchor="middle"
            dominantBaseline="auto"
            fontWeight="600"
          >
            S
          </text>
          <text
            x={fmt(center)}
            y={fmt(center + radius + labelOffset + cardinalFontSize + degFontSize + 2)}
            fontSize={degFontSize}
            textAnchor="middle"
            dominantBaseline="auto"
            fill="#666"
          >
            180°
          </text>

          {/* W */}
          <text
            x={fmt(center - radius - labelOffset)}
            y={fmt(center)}
            fontSize={cardinalFontSize}
            textAnchor="end"
            dominantBaseline="middle"
            fontWeight="600"
          >
            W
          </text>
          <text
            x={fmt(center - radius - labelOffset - cardinalFontSize - 2)}
            y={fmt(center)}
            fontSize={degFontSize}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#666"
          >
            270°
          </text>
        </g>
      )}
    </svg>
  );
}
