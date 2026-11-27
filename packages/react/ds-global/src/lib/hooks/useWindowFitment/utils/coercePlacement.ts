import type { WindowFitmentPlacement, WindowFitmentSide } from "../types.js";

/**
 * Coerces a bare logical side, or a placement, into a full placement.
 *
 * @param entry A side, which centres, or a placement.
 * @returns The placement.
 */
export default function coercePlacement(
  entry: WindowFitmentSide | WindowFitmentPlacement,
): WindowFitmentPlacement {
  return typeof entry === "string" ? { side: entry, align: "center" } : entry;
}
