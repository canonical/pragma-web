import type { JourneyView } from "./types.js";

/**
 * The kinds of hop a journey passes through, its columns from left to
 * right: the demand on the left, the surface that answers it on the right.
 * A pairing reaches a layout only when the surface it pairs to composes
 * one, and most do not; the column stays so that absence reads as a gap.
 */
export const HOP_KINDS = [
  "coordinate",
  "job",
  "pairing",
  "surface",
  "layout",
] as const;

/** The two readings of the demand model, in the switch's order. */
export const JOURNEY_VIEWS: readonly JourneyView[] = ["table", "graph"];

/**
 * The reading a page opens on: the table, the index of every job. It is a
 * constant, read from nothing, so the server's first paint and the
 * client's first render agree.
 */
export const DEFAULT_JOURNEY_VIEW: JourneyView = "table";
