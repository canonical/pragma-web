import type { ReactNode } from "react";
import type { JourneyView } from "../../types.js";

/** What the lens's consumers share: the view and the way to change it. */
export interface JourneyViewValue {
  /** The reading the canvas shows. */
  readonly view: JourneyView;
  /** Show the other reading. */
  readonly setView: (next: JourneyView) => void;
}

/** Props accepted by `JourneyViewProvider`. */
export interface JourneyViewProviderProps {
  /** The strip, the canvas and the inspector, which share the one view. */
  readonly children: ReactNode;
}
