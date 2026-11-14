import type { ComponentProps, ReactNode } from "react";
import type { Condition, QueryChipFault } from "../types.js";

/** QueryChip.Segment's own props. */
type OwnProps = {
  /** The part's text, such as `status` or `≥`. */
  children: ReactNode;
  /** Spoken in place of the text when it differs, such as "at least" for `≥`. */
  label?: string;
  /** The operator's Condition value; set on the operator Segment only. */
  condition?: Condition;
} & QueryChipFault;

/**
 * QueryChip.Segment's props. With `onActivate` the Segment is a button once
 * scripts run, and takes a button's native props, apart from those the chip
 * owns: its type, its label, its tab order, its disabled state and its click
 * handler. Without it, it is plain text and takes a span's. Before scripts
 * run a button's Segment is plain text too: its native props reach the span,
 * but for the button-only ones and its ref and focus handler.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type SegmentProps =
  | (OwnProps & {
      /** Called when the Segment is activated; it makes the Segment a button. */
      onActivate: () => void;
    } & Omit<
        ComponentProps<"button">,
        | keyof OwnProps
        | "onActivate"
        | "onClick"
        | "type"
        | "disabled"
        | "aria-label"
        | "tabIndex"
      >)
  | (OwnProps & {
      /** Called when the Segment is activated; it makes the Segment a button. */
      onActivate?: undefined;
      // The Segment's name is its `label`.
    } & Omit<
        ComponentProps<"span">,
        keyof OwnProps | "onActivate" | "aria-label"
      >);
