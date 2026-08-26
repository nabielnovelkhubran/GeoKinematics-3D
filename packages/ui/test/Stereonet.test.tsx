import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Stereonet } from '../src/Stereonet';

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
      <Stereonet size={SIZE} showLabels={false} lineations={[{ x: 0, y: 0 }]} />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(0, 0, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });

  it('maps North (0, 1) to top of primitive circle', () => {
    const { container } = render(
      <Stereonet size={SIZE} showLabels={false} lineations={[{ x: 0, y: 1 }]} />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(0, 1, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });

  it('maps East (1, 0) to right of primitive circle', () => {
    const { container } = render(
      <Stereonet size={SIZE} showLabels={false} lineations={[{ x: 1, y: 0 }]} />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(1, 0, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });

  it('maps South (0, -1) to bottom of primitive circle', () => {
    const { container } = render(
      <Stereonet size={SIZE} showLabels={false} lineations={[{ x: 0, y: -1 }]} />,
    );
    const marker = container.querySelector('[data-testid="lineations"] circle')!;
    const exp = expectedSvg(0, -1, SIZE, false);
    expect(marker.getAttribute('cx')).toBe(exp.x);
    expect(marker.getAttribute('cy')).toBe(exp.y);
  });

  it('maps West (-1, 0) to left of primitive circle', () => {
    const { container } = render(
      <Stereonet size={SIZE} showLabels={false} lineations={[{ x: -1, y: 0 }]} />,
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
          { x: 0, y: 0 },
          { x: 0.5, y: 0.5 },
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
          { x: 0, y: 0 },
          { x: -0.5, y: 0.5 },
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
      <Stereonet size={200} showLabels={false} poles={[{ x: 0, y: 0 }]} />,
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
          [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
          ],
          [
            { x: 0, y: -1 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
          ],
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
          [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
          ],
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
    const { container } = render(<Stereonet greatCircles={[[], [{ x: 0, y: 0 }]]} />);
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

// ── Empty stereonet ────────────────────────────────────────────────────────────

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
