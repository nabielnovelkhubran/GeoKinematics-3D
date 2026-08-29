import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StereonetInspectorPanel } from '../src/StereonetInspectorPanel';
import type { InspectorEntry } from '../src/inspector-types';

afterEach(cleanup);

const POLE_ENTRY: InspectorEntry = {
  label: 'Plane pole — Plane A',
  id: 'plane-0',
  fields: [
    { name: 'Dip direction', value: '127°' },
    { name: 'Dip', value: '45°' },
  ],
};

describe('StereonetInspectorPanel', () => {
  it('renders "No selection" placeholder when entry is null', () => {
    render(<StereonetInspectorPanel entry={null} />);
    expect(screen.getByText('No selection')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Feature inspector' })).toBeInTheDocument();
  });

  it('renders the entry label when entry is provided', () => {
    render(<StereonetInspectorPanel entry={POLE_ENTRY} />);
    expect(screen.getByText('Plane pole — Plane A')).toBeInTheDocument();
  });

  it('renders all field names and values', () => {
    render(<StereonetInspectorPanel entry={POLE_ENTRY} />);
    const dts = screen.getAllByRole('term');
    expect(dts.some((el) => /Dip direction/.test(el.textContent ?? ''))).toBe(true);
    expect(dts.some((el) => /^Dip\s*:/.test(el.textContent ?? ''))).toBe(true);
    expect(screen.getByText('127°')).toBeInTheDocument();
    expect(screen.getByText('45°')).toBeInTheDocument();
  });

  it('renders the feature id', () => {
    render(<StereonetInspectorPanel entry={POLE_ENTRY} />);
    expect(
      screen.getByText((_, element) => {
        return element?.tagName === 'P' && (element.textContent ?? '').includes('plane-0');
      }),
    ).toBeInTheDocument();
  });
});
