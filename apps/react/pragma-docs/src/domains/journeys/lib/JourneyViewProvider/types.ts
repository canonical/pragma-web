import type { ReactNode } from "react";
import type { JourneyFilterChoice, JourneyView } from "../../types.js";

/**
 * What the lens's consumers share: the view, the graph's filter as the
 * reader chose it, and the ways to change them.
 */
export interface JourneyViewValue {
  /** The reading the canvas shows. */
  readonly view: JourneyView;
  /** Show the other reading. */
  readonly setView: (next: JourneyView) => void;
  /**
   * The filter the reader chose for the graph, with the job on screen when
   * they chose it, or undefined before any choice: the graph then draws
   * the default for the job on screen.
   */
  readonly filter: JourneyFilterChoice | undefined;
  /** Record the reader's choice of filter. */
  readonly setFilter: (next: JourneyFilterChoice) => void;
}

/** Props accepted by `JourneyViewProvider`. */
export interface JourneyViewProviderProps {
  /** The strip, the canvas and the inspector, which share the one view. */
  readonly children: ReactNode;
}
