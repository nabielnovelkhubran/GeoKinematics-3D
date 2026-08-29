import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CursorDisplay } from '../src/CursorDisplay';
import type { StereonetCursor } from '../src/stereonet-types';

afterEach(cleanup);

const CURSOR: StereonetCursor = { x: 0.3, y: -0.2, trend: 127.4, plunge: 34.2 };

describe('CursorDisplay', () => {
  it('renders placeholder "—" when cursor is null', () => {
    render(<CursorDisplay cursor={null} />);
    expect(screen.getByTestId('cursor-placeholder')).toHaveTextContent('—');
    expect(screen.getByRole('generic', { name: 'Cursor position' })).toBeInTheDocument();
  });

  it('renders trend and plunge when cursor is non-null', () => {
    render(<CursorDisplay cursor={CURSOR} />);
    const value = screen.getByTestId('cursor-value');
    expect(value.textContent).toMatch(/127\.4°\s*\/\s*34\.2°/);
  });

  it('formats trend and plunge to one decimal place', () => {
    const sharpCursor: StereonetCursor = { x: 0, y: 0, trend: 0, plunge: 90 };
    render(<CursorDisplay cursor={sharpCursor} />);
    const value = screen.getByTestId('cursor-value');
    expect(value.textContent).toMatch(/0\.0°\s*\/\s*90\.0°/);
  });
});
