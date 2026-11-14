import type { ReactNode } from "react";
import type { Condition, QueryChipFault } from "../types.js";

/**
 * QueryChip.Segment's props. Its element is a button or plain text by
 * state, and the chip owns its root's native props, so a segment takes none.
 */
export type SegmentProps = {
  /** The segment's visible text. */
  children: ReactNode;
  /** Spoken in place of the text, for a symbol such as `≥`. */
  label?: string;
  /** The operator's Condition value; set on the operator segment only. */
  condition?: Condition;
  /**
   * Called when the segment is activated. Passing it makes the segment a
   * button inside a roving toolbar once scripts run; without it the segment
   * is plain text.
   */
  onActivate?: () => void;
} & QueryChipFault;
