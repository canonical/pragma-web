import type {
  PhysicalPlacement,
  WindowFitmentAlign,
  WindowFitmentDirection,
  WindowFitmentPlacement,
} from "../types.js";

/**
 * Maps a logical placement to a physical one for `dir`: the inline axis, and
 * a block side's alignment, mirror in RTL.
 *
 * @param placement The logical placement.
 * @param dir The writing direction.
 * @returns The physical placement.
 */
export default function resolveLogicalPlacement(
  placement: WindowFitmentPlacement,
  dir: "ltr" | "rtl",
): PhysicalPlacement {
  let direction: WindowFitmentDirection;
  // Whether this side's cross-axis is the inline (reading) axis, making its
  // `start`/`end` alignment dir-dependent.
  let crossAxisIsInline: boolean;
  switch (placement.side) {
    case "inline-start":
      direction = dir === "rtl" ? "right" : "left";
      crossAxisIsInline = false;
      break;
    case "inline-end":
      direction = dir === "rtl" ? "left" : "right";
      crossAxisIsInline = false;
      break;
    case "block-start":
      direction = "top";
      crossAxisIsInline = true;
      break;
    default:
      direction = "bottom";
      crossAxisIsInline = true;
      break;
  }

  const mirrorAlign = dir === "rtl" && crossAxisIsInline;
  let align: WindowFitmentAlign = placement.align;
  if (mirrorAlign) {
    if (align === "start") align = "end";
    else if (align === "end") align = "start";
  }

  return { direction, align };
}
