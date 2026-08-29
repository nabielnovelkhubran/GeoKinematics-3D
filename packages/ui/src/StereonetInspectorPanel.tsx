import React from 'react';
import type { InspectorEntry } from './inspector-types';

export interface StereonetInspectorPanelProps {
  /**
   * The currently inspected feature entry, or `null` when nothing is selected.
   * Controlled prop — all formatting is done by the caller before passing here.
   */
  entry: InspectorEntry | null;
}

/**
 * Read-only inspector panel for a selected stereonet feature.
 *
 * Renders the pre-formatted `InspectorEntry` supplied by the workspace page.
 * Performs no geological calculation and imports no geological domain types.
 */
export function StereonetInspectorPanel({
  entry,
}: StereonetInspectorPanelProps): React.ReactElement {
  if (entry === null) {
    return (
      <section
        aria-label="Feature inspector"
        style={{
          padding: '12px 16px',
          color: '#888',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0 }}>No selection</p>
      </section>
    );
  }

  return (
    <section
      aria-label="Feature inspector"
      style={{ padding: '12px 16px', fontFamily: 'system-ui, sans-serif', fontSize: 13 }}
    >
      <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#333' }}>{entry.label}</p>
      <p style={{ margin: '0 0 10px', color: '#666', fontSize: 11 }}>id: {entry.id}</p>
      <dl style={{ margin: 0 }}>
        {entry.fields.map((field) => (
          <React.Fragment key={field.name}>
            <dt
              style={{
                display: 'inline',
                color: '#555',
                marginRight: 4,
              }}
            >
              {field.name}:
            </dt>
            <dd
              style={{
                display: 'inline',
                margin: '0 0 6px',
                color: '#111',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {field.value}
            </dd>
            <br />
          </React.Fragment>
        ))}
      </dl>
    </section>
  );
}
