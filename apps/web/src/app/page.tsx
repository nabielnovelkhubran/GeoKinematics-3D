'use client';

import React, { useState } from 'react';
import { projectPlanePole, projectPlaneGreatCircle, projectLine } from '@geokinematics/geometry';
import type { PlaneOrientation, LineOrientation } from '@geokinematics/domain';
import { Stereonet, StereonetInspectorPanel, CursorDisplay } from '@geokinematics/ui';
import type {
  StereonetCursor,
  StereonetFeature,
  StereonetGreatCircle,
  StereonetLineation,
  StereonetPole,
  StereonetSelection,
  InspectorEntry,
} from '@geokinematics/ui';
import { RenderingShell } from '../components/rendering-shell';

// ── Fixture data ──────────────────────────────────────────────────────────────
// Raw geological records. IDs are stable string keys shared with the projected
// arrays below. Formatting of display values is done in `buildInspectorEntry`.

const PLANE_FIXTURES: ReadonlyArray<PlaneOrientation & { id: string; label: string }> = [
  { id: 'plane-0', label: 'Plane A', dipDirection: 127, dip: 45 },
  { id: 'plane-1', label: 'Plane B', dipDirection: 230, dip: 62 },
  { id: 'plane-2', label: 'Plane C', dipDirection: 45, dip: 30 },
];

const LINE_FIXTURES: ReadonlyArray<LineOrientation & { id: string; label: string }> = [
  { id: 'line-0', label: 'Lineation α', trend: 185, plunge: 22 },
  { id: 'line-1', label: 'Lineation β', trend: 310, plunge: 55 },
];

// ── Pre-projected arrays (module-level constants) ─────────────────────────────

const POLES: StereonetPole[] = PLANE_FIXTURES.map((p) => ({
  id: p.id,
  point: projectPlanePole({ dipDirection: p.dipDirection, dip: p.dip }),
}));

const GREAT_CIRCLES: StereonetGreatCircle[] = PLANE_FIXTURES.map((p) => ({
  id: `gc-${p.id}`,
  points: [...projectPlaneGreatCircle({ dipDirection: p.dipDirection, dip: p.dip })],
}));

const LINEATIONS: StereonetLineation[] = LINE_FIXTURES.map((l) => ({
  id: l.id,
  point: projectLine({ trend: l.trend, plunge: l.plunge }),
}));

// ── ID → geological record lookup ────────────────────────────────────────────

function buildInspectorEntry(feature: StereonetFeature): InspectorEntry | null {
  if (feature.type === 'pole') {
    const record = PLANE_FIXTURES.find((p) => p.id === feature.id);
    if (!record) return null;
    return {
      label: `Plane pole — ${record.label}`,
      id: record.id,
      fields: [
        { name: 'Dip direction', value: `${record.dipDirection}°` },
        { name: 'Dip', value: `${record.dip}°` },
      ],
    };
  }

  if (feature.type === 'greatCircle') {
    // Great-circle IDs are prefixed with 'gc-' over the corresponding plane id.
    const planeId = feature.id.replace(/^gc-/, '');
    const record = PLANE_FIXTURES.find((p) => p.id === planeId);
    if (!record) return null;
    return {
      label: `Great circle — ${record.label}`,
      id: feature.id,
      fields: [
        { name: 'Dip direction', value: `${record.dipDirection}°` },
        { name: 'Dip', value: `${record.dip}°` },
      ],
    };
  }

  if (feature.type === 'lineation') {
    const record = LINE_FIXTURES.find((l) => l.id === feature.id);
    if (!record) return null;
    return {
      label: `Lineation — ${record.label}`,
      id: record.id,
      fields: [
        { name: 'Trend', value: `${record.trend}°` },
        { name: 'Plunge', value: `${record.plunge}°` },
      ],
    };
  }

  return null;
}

// ── Workspace page ────────────────────────────────────────────────────────────

export default function HomePage() {
  const [selection, setSelection] = useState<StereonetSelection | null>(null);
  const [cursor, setCursor] = useState<StereonetCursor | null>(null);
  const [hover, setHover] = useState<StereonetFeature | null>(null);

  const entry = selection !== null ? buildInspectorEntry(selection) : null;

  const handleSelectionChange = (next: StereonetSelection | null) => {
    // Toggle: clicking the same feature deselects it.
    if (
      next !== null &&
      selection !== null &&
      next.type === selection.type &&
      next.id === selection.id
    ) {
      setSelection(null);
    } else {
      setSelection(next);
    }
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ padding: '16px 20px', margin: 0, fontSize: 18, color: '#222' }}>
        GeoKinematics-3D
      </h1>
      <p style={{ margin: '0 20px 12px', fontSize: 13, color: '#666' }}>
        Phase 1D.5 — Stereonet workspace integration
      </p>

      <div
        style={{
          display: 'flex',
          gap: 0,
          border: '1px solid #ddd',
          borderRadius: 6,
          overflow: 'hidden',
          margin: '0 20px 20px',
          maxWidth: 780,
        }}
      >
        {/* Left panel — stereonet */}
        <div
          style={{
            flex: '0 0 auto',
            borderRight: '1px solid #ddd',
            background: '#fff',
          }}
        >
          <Stereonet
            size={400}
            poles={POLES}
            greatCircles={GREAT_CIRCLES}
            lineations={LINEATIONS}
            selection={selection}
            onSelectionChange={handleSelectionChange}
            onHover={setHover}
            onCursorMove={setCursor}
          />
        </div>

        {/* Right panel — cursor + inspector */}
        <div
          style={{
            flex: '1 1 0',
            minWidth: 200,
            display: 'flex',
            flexDirection: 'column',
            background: '#fafafa',
          }}
        >
          {/* Cursor telemetry row */}
          <div
            style={{
              borderBottom: '1px solid #eee',
              padding: '6px 0',
              background: '#fff',
            }}
          >
            <CursorDisplay cursor={cursor} />
          </div>

          {/* Hover hint row */}
          <div
            style={{
              borderBottom: '1px solid #eee',
              padding: '6px 16px',
              fontSize: 12,
              color: '#888',
              minHeight: 28,
            }}
          >
            {hover !== null ? `Hovering: ${hover.type} ${hover.id}` : ''}
          </div>

          {/* Inspector */}
          <StereonetInspectorPanel entry={entry} />
        </div>
      </div>

      {/* 3D Rendering shell */}
      <section style={{ margin: '0 20px' }}>
        <RenderingShell />
      </section>
    </main>
  );
}
