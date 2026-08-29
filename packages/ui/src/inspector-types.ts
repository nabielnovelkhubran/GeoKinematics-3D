// ── Inspector display types ──────────────────────────────────────────────────
// These are pure UI vocabulary types. They carry pre-formatted display strings
// and are intentionally free of any geological domain types.

/**
 * A single field in the selected-feature inspector panel.
 *
 * Both `name` and `value` are display strings — not raw geological property
 * keys. The workspace page is responsible for all formatting.
 *
 * @example
 * { name: 'Dip direction', value: '127°' }
 * { name: 'Dip', value: '45°' }
 */
export interface InspectorField {
  /** Human-readable display label, sentence case. */
  name: string;
  /** Pre-formatted display value ready for rendering. */
  value: string;
}

/**
 * The data model for the selected-feature inspector panel.
 *
 * The workspace page constructs this by looking up the selected feature's ID
 * in its raw geological dataset and converting each field to a display string.
 * The inspector panel renders this value without performing any geological
 * calculation or domain type conversion.
 */
export interface InspectorEntry {
  /** Short human-readable label for the feature type, e.g. "Plane pole". */
  label: string;
  /** Stable feature ID as assigned by the workspace page. */
  id: string;
  /** Ordered list of fields to display in the inspector. */
  fields: ReadonlyArray<InspectorField>;
}
