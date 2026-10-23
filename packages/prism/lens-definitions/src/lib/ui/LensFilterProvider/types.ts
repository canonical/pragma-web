import type { ReactNode } from "react";
import type { LensFilterState } from "../types.js";

/** What the lens's consumers share: the filter and the way to change it. */
export interface LensFilterValue {
  /** The reader's current filter, before `resolveFilter` reads it. */
  readonly filter: LensFilterState;
  /** Replace the filter. */
  readonly setFilter: (next: LensFilterState) => void;
}

/** Props accepted by `LensFilterProvider`. */
export interface LensFilterProviderProps {
  /** The strip and the canvas, which share the one filter. */
  readonly children: ReactNode;
}
