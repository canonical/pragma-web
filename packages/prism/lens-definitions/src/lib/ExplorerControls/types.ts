import type { LensFilter } from "../types.js";

/** One ontology as the toolbar names it: the prefix is the filter's key,
 * the label is what a reader sees. */
export interface NamespaceLabel {
  readonly prefix: string;
  readonly label: string;
}

/** Props accepted by `ExplorerControls`. */
export interface ExplorerControlsProps {
  /** Additional CSS class names. */
  className?: string;
  /** The lens's ephemeral filter — the chips render its lit state. */
  readonly filter: LensFilter;
  /** The ontologies to offer as provenance chips, in query order. */
  readonly namespaceLabels: readonly NamespaceLabel[];
  /** Called with the next filter when a chip toggles. */
  readonly onFilterChange: (next: LensFilter) => void;
}
