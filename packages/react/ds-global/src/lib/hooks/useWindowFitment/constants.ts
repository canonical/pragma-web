import type { WindowFitmentSide } from "./types.js";

/**
 * Arrow-bearing overlay (tooltip/popover) placements: open toward the reading
 * direction first, centred. Resolves in LTR to [right, bottom, left, top].
 */
export const OVERLAY_PLACEMENT: WindowFitmentSide[] = [
  "inline-end",
  "block-end",
  "inline-start",
  "block-start",
];
