import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Stereonet } from '../src/Stereonet';
import type {
  StereonetCursor,
  StereonetFeature,
  StereonetGreatCircle,
  StereonetLineation,
  StereonetPole,
  StereonetSelection,
} from '../src/stereonet-types';

afterEach(cleanup);

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Computes the expected SVG coordinate for a stereonet point, mirroring the
 * component's internal transform:
 *
 *   labelPad = showLabels ? 24 : 10
 *   radius   = (size - labelPad * 2) / 2
 *   center   = size / 2
 *   svgX     = center + stereonetX * radius
 *   svgY     = center - stereonetY * radius
 */
function expectedSvg(
  sx: number,
  sy: number,
  size: number,
  showLabels: boolean,
): { x: string; y: string } {
  const pad = showLabels ? 24 : 10;
  const radius = (size - pad * 2) / 2;
  const center = size / 2;
  return {
    x: (center + sx * radius).toFixed(4),
    y: (center - sy * radius).toFixed(4),
  };
}

// ── Visualization transform ────────────────────────────────────────────────────

describe('visualization transform', () => {
  const SIZE = 200;
  // showLabels=false → labelPad=10, radius=90, center=100

  it('maps center (0, 0) to SVG center', () => {
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        lineations={[{ id: 'l1', point: { x: 0, y: 0 } }]}
      />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(0, 0, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });

  it('maps North (0, 1) to top of primitive circle', () => {
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        lineations={[{ id: 'l1', point: { x: 0, y: 1 } }]}
      />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(0, 1, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });

  it('maps East (1, 0) to right of primitive circle', () => {
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        lineations={[{ id: 'l1', point: { x: 1, y: 0 } }]}
      />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(1, 0, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });

  it('maps South (0, -1) to bottom of primitive circle', () => {
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        lineations={[{ id: 'l1', point: { x: 0, y: -1 } }]}
      />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(0, -1, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });

  it('maps West (-1, 0) to left of primitive circle', () => {
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        lineations={[{ id: 'l1', point: { x: -1, y: 0 } }]}
      />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(-1, 0, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });
});

// ── Primitive circle ───────────────────────────────────────────────────────────

describe('primitive circle', () => {
  it('renders a circle element with correct geometry (showLabels=false)', () => {
    const { container } = render(<Stereonet size={400} showLabels={false} />);
    const circle = container.querySelector('[data-testid="primitive-circle"]')!;
    // labelPad=10 → radius=(400-20)/2=190, center=200
    expect(circle.getAttribute('cx')).toBe('200.0000');
    expect(circle.getAttribute('cy')).toBe('200.0000');
    expect(circle.getAttribute('r')).toBe('190.0000');
  });

  it('adjusts radius when showLabels is true', () => {
    const { container } = render(<Stereonet size={400} showLabels={true} />);
    const circle = container.querySelector('[data-testid="primitive-circle"]')!;
    // labelPad=24 → radius=(400-48)/2=176, center=200
    expect(circle.getAttribute('cx')).toBe('200.0000');
    expect(circle.getAttribute('cy')).toBe('200.0000');
    expect(circle.getAttribute('r')).toBe('176.0000');
  });
});

// ── Grid ───────────────────────────────────────────────────────────────────────

describe('grid', () => {
  it('renders grid group when showGrid is true (default)', () => {
    const { container } = render(<Stereonet />);
    expect(container.querySelector('[data-testid="stereonet-grid"]')).not.toBeNull();
  });

  it('does not render grid group when showGrid is false', () => {
    const { container } = render(<Stereonet showGrid={false} />);
    expect(container.querySelector('[data-testid="stereonet-grid"]')).toBeNull();
  });

  it('renders at least 2 axis lines inside the grid group', () => {
    const { container } = render(<Stereonet gridInterval={10} />);
    const grid = container.querySelector('[data-testid="stereonet-grid"]')!;
    const lines = grid.querySelectorAll('line');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('renders more grid children for smaller gridInterval', () => {
    const { container: c10 } = render(<Stereonet gridInterval={10} />);
    const count10 = c10.querySelector('[data-testid="stereonet-grid"]')!.children.length;

    const { container: c30 } = render(<Stereonet gridInterval={30} />);
    const count30 = c30.querySelector('[data-testid="stereonet-grid"]')!.children.length;

    expect(count10).toBeGreaterThan(count30);
  });

  it('renders only 2 axis lines for gridInterval >= 90', () => {
    const { container } = render(<Stereonet gridInterval={90} />);
    const grid = container.querySelector('[data-testid="stereonet-grid"]')!;
    expect(grid.querySelectorAll('line').length).toBe(2);
    expect(grid.querySelectorAll('path').length).toBe(0);
  });
});

// ── Labels ─────────────────────────────────────────────────────────────────────

describe('labels', () => {
  it('renders labels group when showLabels is true (default)', () => {
    const { container } = render(<Stereonet />);
    expect(container.querySelector('[data-testid="stereonet-labels"]')).not.toBeNull();
  });

  it('does not render labels when showLabels is false', () => {
    const { container } = render(<Stereonet showLabels={false} />);
    expect(container.querySelector('[data-testid="stereonet-labels"]')).toBeNull();
  });

  it('renders N, E, S, W cardinal text', () => {
    const { container } = render(<Stereonet />);
    const labels = container.querySelector('[data-testid="stereonet-labels"]')!;
    const texts = Array.from(labels.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts).toContain('N');
    expect(texts).toContain('E');
    expect(texts).toContain('S');
    expect(texts).toContain('W');
  });

  it('renders 000°, 090°, 180°, 270° degree labels', () => {
    const { container } = render(<Stereonet />);
    const labels = container.querySelector('[data-testid="stereonet-labels"]')!;
    const texts = Array.from(labels.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts).toContain('000°');
    expect(texts).toContain('090°');
    expect(texts).toContain('180°');
    expect(texts).toContain('270°');
  });
});

// ── Lineations ─────────────────────────────────────────────────────────────────

describe('lineations', () => {
  it('renders a circle marker for each lineation', () => {
    const { container } = render(
      <Stereonet
        lineations={[
          { id: 'lin-1', point: { x: 0, y: 0 } },
          { id: 'lin-2', point: { x: 0.5, y: 0.5 } },
        ]}
      />,
    );
    const markers = container.querySelectorAll('[data-testid="lineations"] circle');
    expect(markers).toHaveLength(2);
  });

  it('renders no markers when lineations is empty', () => {
    const { container } = render(<Stereonet lineations={[]} />);
    const markers = container.querySelectorAll('[data-testid="lineations"] circle');
    expect(markers).toHaveLength(0);
  });
});

// ── Poles ──────────────────────────────────────────────────────────────────────

describe('poles', () => {
  it('renders a rectangle marker for each pole', () => {
    const { container } = render(
      <Stereonet
        poles={[
          { id: 'pole-1', point: { x: 0, y: 0 } },
          { id: 'pole-2', point: { x: -0.5, y: 0.5 } },
        ]}
      />,
    );
    const markers = container.querySelectorAll('[data-testid="poles"] rect');
    expect(markers).toHaveLength(2);
  });

  it('renders no markers when poles is empty', () => {
    const { container } = render(<Stereonet poles={[]} />);
    const markers = container.querySelectorAll('[data-testid="poles"] rect');
    expect(markers).toHaveLength(0);
  });

  it('positions pole rectangle correctly via the linear transform', () => {
    const { container } = render(
      <Stereonet size={200} showLabels={false} poles={[{ id: 'pole-1', point: { x: 0, y: 0 } }]} />,
    );
    // center=100, radius=90 → toSvg(0,0)=(100,100). Rect half=4, so x=y=96.
    const rect = container.querySelector('[data-testid="poles"] rect')!;
    expect(rect.getAttribute('x')).toBe('96.0000');
    expect(rect.getAttribute('y')).toBe('96.0000');
  });
});

// ── Great circles ──────────────────────────────────────────────────────────────

describe('great circles', () => {
  it('renders a path for each great circle', () => {
    const { container } = render(
      <Stereonet
        greatCircles={[
          {
            id: 'gc-1',
            points: [
              { x: -1, y: 0 },
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
          },
          {
            id: 'gc-2',
            points: [
              { x: 0, y: -1 },
              { x: 0, y: 0 },
              { x: 0, y: 1 },
            ],
          },
        ]}
      />,
    );
    const paths = container.querySelectorAll('[data-testid="great-circles"] path');
    expect(paths).toHaveLength(2);
  });

  it('renders no paths when greatCircles is empty', () => {
    const { container } = render(<Stereonet greatCircles={[]} />);
    const paths = container.querySelectorAll('[data-testid="great-circles"] path');
    expect(paths).toHaveLength(0);
  });

  it('generates the correct SVG path data from stereonet points', () => {
    const { container } = render(
      <Stereonet
        size={200}
        showLabels={false}
        greatCircles={[
          {
            id: 'gc-1',
            points: [
              { x: -1, y: 0 },
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
          },
        ]}
      />,
    );
    // center=100, radius=90 → W=(10,100), Center=(100,100), E=(190,100)
    const path = container.querySelector('[data-testid="great-circles"] path')!;
    expect(path.getAttribute('d')).toBe(
      'M 10.0000 100.0000 L 100.0000 100.0000 L 190.0000 100.0000',
    );
  });

  it('skips empty great-circle entries', () => {
    const { container } = render(
      <Stereonet
        greatCircles={[
          { id: 'gc-empty', points: [] },
          { id: 'gc-1', points: [{ x: 0, y: 0 }] },
        ]}
      />,
    );
    const paths = container.querySelectorAll('[data-testid="great-circles"] path');
    // first entry is empty → null; second has 1 point → 1 path
    expect(paths).toHaveLength(1);
  });
});

// ── Size configuration ─────────────────────────────────────────────────────────

describe('size configuration', () => {
  it('sets SVG width and height to the size prop', () => {
    const { container } = render(<Stereonet size={600} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('600');
    expect(svg.getAttribute('height')).toBe('600');
  });

  it('defaults to size=400', () => {
    const { container } = render(<Stereonet />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('400');
    expect(svg.getAttribute('height')).toBe('400');
  });
});

// ── gridInterval configuration ─────────────────────────────────────────────────

describe('gridInterval configuration', () => {
  it('uses the provided gridInterval to control grid density', () => {
    const { container: c5 } = render(<Stereonet gridInterval={5} />);
    const count5 = c5.querySelector('[data-testid="stereonet-grid"]')!.children.length;

    const { container: c45 } = render(<Stereonet gridInterval={45} />);
    const count45 = c45.querySelector('[data-testid="stereonet-grid"]')!.children.length;

    expect(count5).toBeGreaterThan(count45);
  });
});

// ── Empty stereonet ────────────────────────────────────────────────────

describe('empty stereonet', () => {
  it('renders all structural elements with no data points', () => {
    const { container } = render(<Stereonet />);
    expect(container.querySelector('[data-testid="primitive-circle"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="stereonet-grid"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="stereonet-labels"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-testid="lineations"] circle')).toHaveLength(0);
    expect(container.querySelectorAll('[data-testid="poles"] rect')).toHaveLength(0);
    expect(container.querySelectorAll('[data-testid="great-circles"] path')).toHaveLength(0);
  });
});

// ── Phase 1D.2: Interaction contract ──────────────────────────────────────────

// ── Feature identity ──────────────────────────────────────────────────────────

describe('feature identity — poles require stable IDs', () => {
  it('accepts StereonetPole objects with id and point', () => {
    const pole: StereonetPole = { id: 'p-001', point: { x: 0.5, y: 0.3 } };
    expect(pole.id).toBe('p-001');
    expect(pole.point.x).toBe(0.5);
    expect(pole.point.y).toBe(0.3);
  });

  it('renders with stable id-keyed markers', () => {
    const { container } = render(
      <Stereonet poles={[{ id: 'stable-pole', point: { x: 0, y: 0 } }]} />,
    );
    expect(container.querySelectorAll('[data-testid="poles"] rect')).toHaveLength(1);
  });
});

describe('feature identity — lineations require stable IDs', () => {
  it('accepts StereonetLineation objects with id and point', () => {
    const lin: StereonetLineation = { id: 'lin-001', point: { x: -0.2, y: 0.7 } };
    expect(lin.id).toBe('lin-001');
    expect(lin.point.x).toBe(-0.2);
    expect(lin.point.y).toBe(0.7);
  });

  it('renders with stable id-keyed markers', () => {
    const { container } = render(
      <Stereonet lineations={[{ id: 'stable-lin', point: { x: 0, y: 0 } }]} />,
    );
    expect(container.querySelectorAll('[data-testid="lineations"] circle')).toHaveLength(1);
  });
});

describe('feature identity — great circles require stable IDs', () => {
  it('accepts StereonetGreatCircle objects with id and points', () => {
    const gc: StereonetGreatCircle = {
      id: 'gc-001',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
    };
    expect(gc.id).toBe('gc-001');
    expect(gc.points).toHaveLength(2);
  });

  it('renders with stable id-keyed paths', () => {
    const { container } = render(
      <Stereonet
        greatCircles={[
          {
            id: 'stable-gc',
            points: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
          },
        ]}
      />,
    );
    expect(container.querySelectorAll('[data-testid="great-circles"] path')).toHaveLength(1);
  });
});

// ── Feature discrimination ─────────────────────────────────────────────────────

describe('feature discrimination — StereonetFeature type union', () => {
  it('discriminates pole features by type', () => {
    const f: StereonetFeature = { type: 'pole', id: 'p-1' };
    expect(f.type).toBe('pole');
    if (f.type === 'pole') {
      expect(f.id).toBe('p-1');
    }
  });

  it('discriminates lineation features by type', () => {
    const f: StereonetFeature = { type: 'lineation', id: 'l-1' };
    expect(f.type).toBe('lineation');
    if (f.type === 'lineation') {
      expect(f.id).toBe('l-1');
    }
  });

  it('discriminates great-circle features by type', () => {
    const f: StereonetFeature = { type: 'greatCircle', id: 'gc-1' };
    expect(f.type).toBe('greatCircle');
    if (f.type === 'greatCircle') {
      expect(f.id).toBe('gc-1');
    }
  });

  it('three feature types are distinguishable', () => {
    const features: StereonetFeature[] = [
      { type: 'pole', id: 'p-1' },
      { type: 'lineation', id: 'l-1' },
      { type: 'greatCircle', id: 'gc-1' },
    ];
    const types = features.map((f) => f.type);
    expect(types).toContain('pole');
    expect(types).toContain('lineation');
    expect(types).toContain('greatCircle');
    expect(new Set(types).size).toBe(3);
  });
});

// ── Selection contract ─────────────────────────────────────────────────────────

describe('selection contract — component accepts selection prop', () => {
  it('accepts null selection (no selection)', () => {
    const { container } = render(<Stereonet selection={null} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('accepts a pole selection', () => {
    const sel: StereonetSelection = { type: 'pole', id: 'p-1' };
    const { container } = render(<Stereonet selection={sel} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('accepts a lineation selection', () => {
    const sel: StereonetSelection = { type: 'lineation', id: 'l-1' };
    const { container } = render(<Stereonet selection={sel} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('accepts a great-circle selection', () => {
    const sel: StereonetSelection = { type: 'greatCircle', id: 'gc-1' };
    const { container } = render(<Stereonet selection={sel} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('selection prop is optional — renders without it', () => {
    const { container } = render(<Stereonet />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

// ── Callback rendering contract ────────────────────────────────────────────────

describe('callback contract — new props do not break rendering', () => {
  it('accepts onSelectionChange without calling it', () => {
    const handler = vi.fn();
    const { container } = render(<Stereonet onSelectionChange={handler} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(handler).not.toHaveBeenCalled();
  });

  it('accepts onHover without calling it', () => {
    const handler = vi.fn();
    const { container } = render(<Stereonet onHover={handler} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(handler).not.toHaveBeenCalled();
  });

  it('accepts onCursorMove without calling it', () => {
    const handler = vi.fn();
    const { container } = render(<Stereonet onCursorMove={handler} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(handler).not.toHaveBeenCalled();
  });

  it('accepts all interaction props simultaneously without breaking rendering', () => {
    const onSelectionChange = vi.fn();
    const onHover = vi.fn();
    const onCursorMove = vi.fn();
    const sel: StereonetSelection = { type: 'pole', id: 'p-1' };
    const { container } = render(
      <Stereonet
        poles={[{ id: 'p-1', point: { x: 0.3, y: 0.4 } }]}
        lineations={[{ id: 'l-1', point: { x: -0.2, y: 0.1 } }]}
        greatCircles={[
          {
            id: 'gc-1',
            points: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
          },
        ]}
        selection={sel}
        onSelectionChange={onSelectionChange}
        onHover={onHover}
        onCursorMove={onCursorMove}
      />,
    );
    expect(container.querySelector('[data-testid="primitive-circle"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-testid="poles"] rect')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="lineations"] circle')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="great-circles"] path')).toHaveLength(1);
    // No pointer interaction yet — no callbacks should fire on render
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onHover).not.toHaveBeenCalled();
    expect(onCursorMove).not.toHaveBeenCalled();
  });
});

// ── StereonetCursor contract ───────────────────────────────────────────────────

describe('StereonetCursor type contract', () => {
  it('carries normalized stereonet coordinates and geological orientation', () => {
    const cursor: StereonetCursor = { x: 0.5, y: -0.3, trend: 120, plunge: 30 };
    expect(cursor.x).toBe(0.5);
    expect(cursor.y).toBe(-0.3);
    expect(cursor.trend).toBe(120);
    expect(cursor.plunge).toBe(30);
  });
});

// ── Phase 1D.4: Pointer Interaction ───────────────────────────────────────────

describe('pointer movement and cursor tracking', () => {
  const SIZE = 400;
  // showLabels=false → center=200, radius=190

  it('emits geological cursor data when moving over center (sx=0, sy=0)', () => {
    const onCursorMove = vi.fn();
    const { container } = render(
      <Stereonet size={SIZE} showLabels={false} onCursorMove={onCursorMove} />,
    );
    const svg = container.querySelector('svg')!;

    fireEvent.pointerMove(svg, { clientX: 200, clientY: 200 });

    expect(onCursorMove).toHaveBeenCalledTimes(1);
    const cursor = onCursorMove.mock.calls[0][0];
    expect(cursor).not.toBeNull();
    expect(cursor.x).toBeCloseTo(0, 4);
    expect(cursor.y).toBeCloseTo(0, 4);
    expect(cursor.trend).toBeCloseTo(0, 4);
    expect(cursor.plunge).toBeCloseTo(90, 4);
  });

  it('emits geological cursor data for cardinal points inside the stereonet', () => {
    const onCursorMove = vi.fn();
    const { container } = render(
      <Stereonet size={SIZE} showLabels={false} onCursorMove={onCursorMove} />,
    );
    const svg = container.querySelector('svg')!;

    // North: sx = 0, sy = 1 -> svgX = 200, svgY = 10 -> trend = 0, plunge = 0
    fireEvent.pointerMove(svg, { clientX: 200, clientY: 10 });
    let cursor = onCursorMove.mock.calls[0][0];
    expect(cursor.trend).toBeCloseTo(0, 2);
    expect(cursor.plunge).toBeCloseTo(0, 2);

    // East: sx = 1, sy = 0 -> svgX = 390, svgY = 200 -> trend = 90, plunge = 0
    fireEvent.pointerMove(svg, { clientX: 390, clientY: 200 });
    cursor = onCursorMove.mock.calls[1][0];
    expect(cursor.trend).toBeCloseTo(90, 2);
    expect(cursor.plunge).toBeCloseTo(0, 2);

    // South: sx = 0, sy = -1 -> svgX = 200, svgY = 390 -> trend = 180, plunge = 0
    fireEvent.pointerMove(svg, { clientX: 200, clientY: 390 });
    cursor = onCursorMove.mock.calls[2][0];
    expect(cursor.trend).toBeCloseTo(180, 2);
    expect(cursor.plunge).toBeCloseTo(0, 2);

    // West: sx = -1, sy = 0 -> svgX = 10, svgY = 200 -> trend = 270, plunge = 0
    fireEvent.pointerMove(svg, { clientX: 10, clientY: 200 });
    cursor = onCursorMove.mock.calls[3][0];
    expect(cursor.trend).toBeCloseTo(270, 2);
    expect(cursor.plunge).toBeCloseTo(0, 2);
  });

  it('emits null when pointer is outside the primitive circle', () => {
    const onCursorMove = vi.fn();
    const { container } = render(
      <Stereonet size={SIZE} showLabels={false} onCursorMove={onCursorMove} />,
    );
    const svg = container.querySelector('svg')!;

    // Top-left corner (svgX=5, svgY=5) is far outside circle radius 190
    fireEvent.pointerMove(svg, { clientX: 5, clientY: 5 });

    expect(onCursorMove).toHaveBeenCalledWith(null);
  });

  it('emits null for cursor and hover when pointer leaves the component', () => {
    const onCursorMove = vi.fn();
    const onHover = vi.fn();
    const { container } = render(
      <Stereonet size={SIZE} showLabels={false} onCursorMove={onCursorMove} onHover={onHover} />,
    );
    const svg = container.querySelector('svg')!;

    fireEvent.pointerLeave(svg);

    expect(onCursorMove).toHaveBeenCalledWith(null);
    expect(onHover).toHaveBeenCalledWith(null);
  });
});

describe('feature hover detection & priority', () => {
  const SIZE = 400;
  // center=200, radius=190

  it('detects hover on pole feature', () => {
    const onHover = vi.fn();
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        poles={[{ id: 'pole-1', point: { x: 0, y: 0 } }]}
        onHover={onHover}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Pole at (0, 0) is at SVG (200, 200)
    fireEvent.pointerMove(svg, { clientX: 202, clientY: 202 });

    expect(onHover).toHaveBeenCalledWith({ type: 'pole', id: 'pole-1' });
  });

  it('detects hover on lineation feature', () => {
    const onHover = vi.fn();
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        lineations={[{ id: 'lin-1', point: { x: 0.5, y: 0 } }]}
        onHover={onHover}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Lineation at (0.5, 0) is at SVG (200 + 0.5*190, 200) = (295, 200)
    fireEvent.pointerMove(svg, { clientX: 295, clientY: 202 });

    expect(onHover).toHaveBeenCalledWith({ type: 'lineation', id: 'lin-1' });
  });

  it('detects hover on great-circle path segment', () => {
    const onHover = vi.fn();
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        greatCircles={[
          {
            id: 'gc-1',
            points: [
              { x: -1, y: 0 },
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
          },
        ]}
        onHover={onHover}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Great circle horizontal trace is at svgY = 200 from svgX=10 to 390
    fireEvent.pointerMove(svg, { clientX: 100, clientY: 202 });

    expect(onHover).toHaveBeenCalledWith({ type: 'greatCircle', id: 'gc-1' });
  });

  it('emits null when moving to an empty region', () => {
    const onHover = vi.fn();
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        poles={[{ id: 'pole-1', point: { x: 0, y: 0 } }]}
        onHover={onHover}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Empty region away from center
    fireEvent.pointerMove(svg, { clientX: 200, clientY: 100 });

    expect(onHover).toHaveBeenCalledWith(null);
  });

  it('gives point features priority over intersecting great circles', () => {
    const onHover = vi.fn();
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        poles={[{ id: 'pole-center', point: { x: 0, y: 0 } }]}
        greatCircles={[
          {
            id: 'gc-center',
            points: [
              { x: -1, y: 0 },
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
          },
        ]}
        onHover={onHover}
      />,
    );
    const svg = container.querySelector('svg')!;

    // Point directly at center where both pole and great-circle pass
    fireEvent.pointerMove(svg, { clientX: 200, clientY: 200 });

    expect(onHover).toHaveBeenCalledWith({ type: 'pole', id: 'pole-center' });
  });
});

describe('feature selection and controlled visual distinction', () => {
  const SIZE = 400;

  it('calls onSelectionChange when clicking a pole', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        poles={[{ id: 'p-target', point: { x: 0, y: 0 } }]}
        onSelectionChange={onSelectionChange}
      />,
    );
    const svg = container.querySelector('svg')!;

    fireEvent.click(svg, { clientX: 200, clientY: 200 });

    expect(onSelectionChange).toHaveBeenCalledWith({ type: 'pole', id: 'p-target' });
  });

  it('calls onSelectionChange when clicking a lineation', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        lineations={[{ id: 'l-target', point: { x: 0, y: 0 } }]}
        onSelectionChange={onSelectionChange}
      />,
    );
    const svg = container.querySelector('svg')!;

    fireEvent.click(svg, { clientX: 200, clientY: 200 });

    expect(onSelectionChange).toHaveBeenCalledWith({ type: 'lineation', id: 'l-target' });
  });

  it('calls onSelectionChange when clicking a great circle', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        greatCircles={[
          {
            id: 'gc-target',
            points: [
              { x: -1, y: 0 },
              { x: 1, y: 0 },
            ],
          },
        ]}
        onSelectionChange={onSelectionChange}
      />,
    );
    const svg = container.querySelector('svg')!;

    fireEvent.click(svg, { clientX: 100, clientY: 200 });

    expect(onSelectionChange).toHaveBeenCalledWith({ type: 'greatCircle', id: 'gc-target' });
  });

  it('renders selected feature with data-selected attribute and distinctive styling', () => {
    const { container, rerender } = render(
      <Stereonet
        size={SIZE}
        showLabels={false}
        poles={[{ id: 'item-1', point: { x: 0, y: 0 } }]}
        lineations={[{ id: 'item-1', point: { x: 0.5, y: 0 } }]}
        greatCircles={[
          {
            id: 'gc-1',
            points: [
              { x: -1, y: 0 },
              { x: 1, y: 0 },
            ],
          },
        ]}
        selection={{ type: 'pole', id: 'item-1' }}
      />,
    );

    const poleRect = container.querySelector('rect[data-id="item-1"]')!;
    const linCircle = container.querySelector('circle[data-id="item-1"]')!;
    const gcPath = container.querySelector('path[data-id="gc-1"]')!;

    // Pole is selected; lineation with same id is NOT selected (type discriminator)
    expect(poleRect.getAttribute('data-selected')).toBe('true');
    expect(linCircle.getAttribute('data-selected')).toBeNull();
    expect(gcPath.getAttribute('data-selected')).toBeNull();

    // Rerender with great circle selected
    rerender(
      <Stereonet
        size={SIZE}
        showLabels={false}
        poles={[{ id: 'item-1', point: { x: 0, y: 0 } }]}
        lineations={[{ id: 'item-1', point: { x: 0.5, y: 0 } }]}
        greatCircles={[
          {
            id: 'gc-1',
            points: [
              { x: -1, y: 0 },
              { x: 1, y: 0 },
            ],
          },
        ]}
        selection={{ type: 'greatCircle', id: 'gc-1' }}
      />,
    );

    expect(poleRect.getAttribute('data-selected')).toBeNull();
    expect(gcPath.getAttribute('data-selected')).toBe('true');
  });
});

describe('viewport bounding client rect offset robustness', () => {
  it('correctly maps pointer coordinates when SVG is offset from the viewport origin', () => {
    const onCursorMove = vi.fn();
    const { container } = render(
      <Stereonet size={400} showLabels={false} onCursorMove={onCursorMove} />,
    );
    const svg = container.querySelector('svg')!;

    // Mock getBoundingClientRect with non-zero top-left offset
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
      width: 400,
      height: 400,
      right: 500,
      bottom: 450,
      x: 100,
      y: 50,
      toJSON: () => {},
    });

    // clientX = 100 + 200 = 300, clientY = 50 + 200 = 250 -> Center of 400x400 SVG
    fireEvent.pointerMove(svg, { clientX: 300, clientY: 250 });

    expect(onCursorMove).toHaveBeenCalledTimes(1);
    const cursor = onCursorMove.mock.calls[0][0];
    expect(cursor).not.toBeNull();
    expect(cursor.x).toBeCloseTo(0, 4);
    expect(cursor.y).toBeCloseTo(0, 4);
    expect(cursor.trend).toBeCloseTo(0, 4);
    expect(cursor.plunge).toBeCloseTo(90, 4);
  });
});
