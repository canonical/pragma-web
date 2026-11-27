import type { ArrowOffset, WindowFitmentDirection } from "../types.js";

/**
 * Shifts an arrow along the popup's edge so it points at the target's
 * centre, clamped to the popup's half-extent.
 *
 * @param direction The side of the target the popup is placed on.
 * @param targetRect The bounding client rect of the target element.
 * @param popupRect The bounding client rect of the popup element.
 * @param popupPosition The popup's top-left as fitment just computed it;
 *   its live rect lags a frame behind. Defaults to the rect's own.
 * @returns The arrow axis and offset in pixels.
 */
export default function computeArrowOffset(
  direction: WindowFitmentDirection,
  targetRect: DOMRect,
  popupRect: DOMRect,
  popupPosition: { top: number; left: number } = {
    top: popupRect.top,
    left: popupRect.left,
  },
): ArrowOffset {
  const isVerticalPlacement = direction === "top" || direction === "bottom";
  const axis = isVerticalPlacement ? "x" : "y";

  const targetCentre = isVerticalPlacement
    ? targetRect.left + targetRect.width / 2
    : targetRect.top + targetRect.height / 2;
  const popupCentre = isVerticalPlacement
    ? popupPosition.left + popupRect.width / 2
    : popupPosition.top + popupRect.height / 2;

  const halfExtent = isVerticalPlacement
    ? popupRect.width / 2
    : popupRect.height / 2;

  const rawOffset = targetCentre - popupCentre;
  const clampedOffset = Math.max(-halfExtent, Math.min(halfExtent, rawOffset));

  return { axis, offset: clampedOffset };
}
