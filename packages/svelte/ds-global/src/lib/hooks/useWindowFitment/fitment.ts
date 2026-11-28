import type {
  ArrowOffset,
  BestPosition,
  FitmentBounds,
  RelativePosition,
  WindowFitmentAlign,
  WindowFitmentDirection,
  WindowFitmentPlacement,
  WindowFitmentSide,
} from "./types.js";

/** A resolved PHYSICAL placement — what the fitment core consumes internally. */
export type PhysicalPlacement = {
  direction: WindowFitmentDirection;
  align: WindowFitmentAlign;
};

/** Coerce a bare logical side or a placement into a full logical placement. */
export const toPlacement = (
  entry: WindowFitmentSide | WindowFitmentPlacement,
): WindowFitmentPlacement =>
  typeof entry === "string" ? { side: entry, align: "center" } : entry;

/**
 * Map a LOGICAL placement to a PHYSICAL one for a writing direction. The inline
 * axis follows `dir` (mirrors in RTL); the block axis is dir-invariant.
 *
 * `align` positions the popup along its side's CROSS axis, so whether it is
 * dir-dependent follows from the side:
 *
 * - An `inline-*` side has a block (vertical) cross-axis. `start` is the top
 *   edge in every writing direction, so align passes through UNMODIFIED.
 * - A `block-*` side has an INLINE (horizontal) cross-axis — the reading axis.
 *   There `start` means the LEADING edge: the left edge in LTR, the RIGHT edge
 *   in RTL. So `start`/`end` are mirrored here for RTL, which is what makes a
 *   leading-aligned dropdown (`MENU_ROOT_PLACEMENT`) open from the trigger's
 *   right edge in RTL instead of its left. `center` is its own mirror.
 */
export const resolveLogicalPlacement = (
  placement: WindowFitmentPlacement,
  dir: "ltr" | "rtl",
): PhysicalPlacement => {
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
};

/**
 * Read the document's writing direction from the root `<html>` element — the
 * single source of truth for the app's locale direction. Since the popup is
 * portalled under `<html>` too, both the positioning and any CSS keyed on
 * `html[dir="rtl"]` (e.g. a mirrored caret) agree without per-element reads.
 * @note Impure — reads the DOM. Defaults `ltr` on the server.
 */
export const readHtmlDirection = (): "ltr" | "rtl" => {
  if (typeof document === "undefined") return "ltr";
  return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
};

/**
 * Compute the cross-axis displacement needed to keep an arrow pointing at the
 * target's centre for a given placement. The arrow sits at the popup edge
 * centre by default; this returns how far to shift it so it aligns with the
 * target centre, clamped to the popup's half-extent so it never leaves the edge.
 * @param direction The side of the target the popup is placed on.
 * @param targetRect The bounding client rect of the target element.
 * @param popupRect The bounding client rect of the popup element.
 * @returns The arrow axis and offset in pixels.
 */
export const computeArrowOffset = (
  direction: WindowFitmentDirection,
  targetRect: DOMRect,
  popupRect: DOMRect,
  /**
   * The authoritative popup position (top-left, viewport coordinates) as just
   * computed by fitment. The popup's live `getBoundingClientRect()` lags one
   * frame behind `bestPosition` (it still reflects the previous placement while
   * the new `left`/`top` are applied), so measuring the centre from the live
   * rect yields a stale offset and the arrow drifts off the anchor. Passing the
   * authoritative position removes that lag; the rect is still used for the
   * popup's stable width/height. Defaults to the rect's own top-left.
   */
  popupPosition: { top: number; left: number } = {
    top: popupRect.top,
    left: popupRect.left,
  },
): ArrowOffset => {
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
};

/**
 * The bounds of the window, inset by a CSS padding-like `gutter` string
 * (e.g. '10px', '10px 20px', '10px 20px 30px 40px'), each value in pixels.
 * @param gutter The gutter around the viewport.
 * @param windowWidth The window width.
 * @param windowHeight The window height.
 * @returns The usable bounds, relative to the viewport.
 */
export const computeBounds = (
  gutter: string,
  windowWidth: number,
  windowHeight: number,
): FitmentBounds => {
  const gutterValues = gutter.split(" ").map((val) => Number.parseInt(val, 10));
  const topGutter = gutterValues[0] || 0;
  const rightGutter = gutterValues[1] || gutterValues[0] || 0;
  const bottomGutter = gutterValues[2] || gutterValues[0] || 0;
  const leftGutter = gutterValues[3] || gutterValues[1] || gutterValues[0] || 0;

  return {
    top: topGutter,
    left: leftGutter,
    right: windowWidth - rightGutter,
    bottom: windowHeight - bottomGutter,
  };
};

/**
 * Calculate the relative position of the popup when oriented in a given direction.
 * @param direction The side of the target element to position the popup on.
 * @param align Where the popup sits along that side's cross-axis.
 * @param targetRect The bounding client rect of the target element.
 * @param popupRect The bounding client rect of the popup element.
 * @param distance The distance, in pixels, between the target and the popup.
 * @returns The calculated relative position of the popup.
 */
export const calculateRelativePosition = (
  direction: WindowFitmentDirection,
  align: WindowFitmentAlign,
  targetRect: DOMRect,
  popupRect: DOMRect,
  distance: number,
): RelativePosition => {
  let left = 0;
  let top = 0;

  /*
    We use left and top offsets to position the popup relative to the target element.
    Then, we apply a margin on the opposite side of the popup to create a buffer zone between the target and the popup, to prevent a mouseleave event when moving from the target to the popup.
    The fake margin is already included in `targetRect` dimensions, as it is rendered hidden at least once before the popup is shown.
    In cases where `targetRect` is not included in the calculation, we add `distance` to account for the fake margin.
   */

  // Cross-axis offset along a side's cross-axis:
  //   start  → target's leading edge (offset 0)
  //   end    → target's trailing edge
  //   center → centred
  const crossAxisOffset = (
    targetExtent: number,
    popupExtent: number,
  ): number => {
    switch (align) {
      case "start":
        return 0;
      case "end":
        return targetExtent - popupExtent;
      default:
        return (targetExtent - popupExtent) / 2;
    }
  };

  // horizontal offset
  switch (direction) {
    case "top":
    case "bottom":
      // horizontal is the CROSS axis here → align applies
      left = crossAxisOffset(targetRect.width, popupRect.width);
      break;
    case "right":
      left = targetRect.width;
      break;
    case "left":
      left = -(popupRect.width + distance);
      break;
  }

  // vertical offset
  switch (direction) {
    case "top":
      top = -(popupRect.height + distance);
      break;
    case "bottom":
      top = targetRect.height;
      break;
    case "right":
    case "left":
      // vertical is the CROSS axis here → align applies
      top = crossAxisOffset(targetRect.height, popupRect.height);
      break;
  }

  return { left, top };
};

/**
 * Check if the popup fits within the bounds.
 * @param candidatePosition The absolute position of the popup
 * @param popupRect The bounding client rect of the popup element.
 * @param bounds The usable bounds of the window.
 * @returns Whether the popup fits within the window.
 */
export const fitsInWindow = (
  candidatePosition: RelativePosition,
  popupRect: DOMRect,
  bounds: FitmentBounds,
): boolean => {
  // Absolute position of the popup's vertices, relative to the viewport
  const vertices = {
    top: candidatePosition.top,
    right: candidatePosition.left + popupRect.width,
    bottom: candidatePosition.top + popupRect.height,
    left: candidatePosition.left,
  };

  return (
    vertices.top >= bounds.top &&
    vertices.right <= bounds.right &&
    vertices.bottom <= bounds.bottom &&
    vertices.left >= bounds.left
  );
};

/**
 * Find the best position for the popup based on the preferred directions.
 * @param targetRect The bounding client rect of the target element.
 * @param popupRect The bounding client rect of the popup element.
 * @param placements The physical placements to try, in order.
 * @param options The distance, the usable bounds, and whether to auto-fit.
 * @returns The best absolute position for the popup.
 * @throws When `placements` is empty.
 */
export const findBestPosition = (
  targetRect: DOMRect,
  popupRect: DOMRect,
  placements: PhysicalPlacement[],
  {
    distance,
    bounds,
    autoFit,
  }: { distance: number; bounds: FitmentBounds; autoFit: boolean },
): BestPosition => {
  let fallbackPosition: BestPosition | undefined;
  let fallbackScore = Number.POSITIVE_INFINITY;

  if (!placements.length) {
    throw new Error("Preferred directions must not be empty.");
  }

  for (const { direction, align } of placements) {
    const relativePosition = calculateRelativePosition(
      direction,
      align,
      targetRect,
      popupRect,
      distance,
    );

    // The natural (unclamped) placement for this side.
    const naturalPosition = {
      top: targetRect.top + relativePosition.top,
      left: targetRect.left + relativePosition.left,
    };

    // Whether this side fits WITHOUT auto-fit clamping. This must be tested
    // on the natural position — testing a clamped position would always
    // report `fits: true`, so the loop would return the first placement and
    // never flip to a side that actually has room.
    const naturallyFits = fitsInWindow(naturalPosition, popupRect, bounds);

    // A side that naturally fits wins immediately, at its exact position.
    if (naturallyFits) {
      return {
        positionName: direction,
        align,
        position: naturalPosition,
        fits: true,
        autoFitOffset: { top: 0, left: 0 },
      };
    }

    // Auto-fit produces a clamped variant (nudged back into bounds) used
    // only as the fallback when no side fits naturally.
    const absolutePosition = { ...naturalPosition };
    const autoFitOffset = { top: 0, left: 0 };
    if (autoFit) {
      if (absolutePosition.top < bounds.top) {
        autoFitOffset.top = bounds.top - absolutePosition.top;
        absolutePosition.top = bounds.top;
      } else if (absolutePosition.top + popupRect.height > bounds.bottom) {
        autoFitOffset.top =
          bounds.bottom - (absolutePosition.top + popupRect.height);
        absolutePosition.top = bounds.bottom - popupRect.height;
      }

      if (absolutePosition.left < bounds.left) {
        autoFitOffset.left = -1 * (bounds.left - absolutePosition.left);
        absolutePosition.left = bounds.left;
      } else if (absolutePosition.left + popupRect.width > bounds.right) {
        autoFitOffset.left =
          -1 * (bounds.right - (absolutePosition.left + popupRect.width));
        absolutePosition.left = bounds.right - popupRect.width;
      }
    }

    // No side fits naturally → this placement is a fallback candidate. Keep
    // the LEAST-clamped one (smallest total auto-fit offset) rather than
    // always taking the first: the placement that overflows the viewport
    // least sits closest to its ideal spot.
    const clampCost =
      Math.abs(autoFitOffset.top) + Math.abs(autoFitOffset.left);
    if (!fallbackPosition || clampCost < fallbackScore) {
      fallbackPosition = {
        positionName: direction,
        align,
        position: absolutePosition,
        fits: false,
        autoFitOffset,
      };
      fallbackScore = clampCost;
    }
  }

  return fallbackPosition as BestPosition;
};

/**
 * The side of the popup that carries the fake margin: the side facing the
 * target, so the gap between them stays hoverable.
 * @param positionName The side of the target the popup is placed on.
 * @returns The CSS margin property for that side.
 */
export const fakeMarginProperty = (
  positionName: WindowFitmentDirection | undefined,
): string => {
  switch (positionName) {
    case "top":
      return "margin-bottom";
    case "left":
      return "margin-right";
    case "right":
      return "margin-left";
    default:
      return "margin-top";
  }
};
