import type { FacetValue } from "@canonical/dataviews-core";

/**
 * Props of the bar drawing.
 *
 * Exempt from the native-prop extension convention: an internal renderer
 * drawing its figure from the facet, not forwarding a caller's native props.
 */
export type BarDrawingProps = {
  /** The chart's label, which captions the table and names the drawing. */
  readonly label: string;
  /** The values drawn, in the source's order; never empty. */
  readonly values: readonly FacetValue[];
};
