import type { ReactNode } from "react";
import type { EntityFilter } from "../../types.js";

/** What the lens's consumers share: the filter and the way to change it. */
export interface EntityFilterValue {
  /** The reader's current filter. */
  readonly filter: EntityFilter;
  /** Replace the filter. */
  readonly setFilter: (next: EntityFilter) => void;
}

/** Props accepted by `EntityFilterProvider`. */
export interface EntityFilterProviderProps {
  /** The strip and the canvas, which share the one filter. */
  readonly children: ReactNode;
}
