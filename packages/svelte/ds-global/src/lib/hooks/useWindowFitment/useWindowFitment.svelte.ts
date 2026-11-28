import { useResizeObserver } from "../useResizeObserver/index.js";
import { useWindowDimensions } from "../useWindowDimensions/index.js";
import {
  computeArrowOffset,
  computeBounds,
  fakeMarginProperty,
  findBestPosition,
  readHtmlDirection,
  resolveLogicalPlacement,
  toPlacement,
} from "./fitment.js";
import type {
  ArrowOffset,
  BestPosition,
  UseWindowFitmentProps,
  UseWindowFitmentResult,
  WindowFitmentElements,
  WindowFitmentPlacement,
  WindowFitmentSide,
} from "./types.js";

const DEFAULT_PREFERRED_DIRECTIONS: readonly (
  | WindowFitmentSide
  | WindowFitmentPlacement
)[] = ["block-start", "block-end", "inline-start", "inline-end"];

/**
 * Positions a popup against a target so it fits in the window: it tries the
 * preferred placements in order, takes the first that fits, and otherwise
 * falls back to the least-clamped one. Logical placements resolve against the
 * document's writing direction, and the position follows window resizes and
 * scrolls, and size changes of the target and the popup.
 * @param getProps Reads the fitment options.
 * @param elements Reads the target and popup elements.
 * @returns The best position, the popup's inline position style, the arrow
 * offset and the resolved writing direction.
 * @note Impure: creates state and effects; call during component
 * initialisation.
 */
export default function useWindowFitment(
  getProps: () => UseWindowFitmentProps,
  elements: WindowFitmentElements,
): UseWindowFitmentResult {
  const isServer = typeof window === "undefined";
  // Bumped when the document's `dir` flips with no layout change, so the
  // logical→physical resolution re-runs.
  let dirVersion = $state(0);

  const windowDimensions = useWindowDimensions(() => {
    const { resizeDelay = 150, scrollDelay = 150 } = getProps();
    return { resizeDelay, scrollDelay };
  });
  const targetSize = useResizeObserver(() => elements.target);
  const popupSize = useResizeObserver(() => elements.popup);

  /** The distance, in pixels, between the target and the popup. */
  const distance = $derived(
    Number.parseInt(getProps().distance ?? "0px", 10) || 0,
  );

  /** The writing direction: the `direction` override, else `<html dir>`. */
  const direction = $derived.by(() => {
    void dirVersion;
    return getProps().direction ?? readHtmlDirection();
  });

  /** The best possible position for the popup. */
  const bestPosition: BestPosition | undefined = $derived.by(() => {
    const {
      preferredDirections = DEFAULT_PREFERRED_DIRECTIONS,
      gutter = "0px",
      autoFit = false,
      isOpen,
    } = getProps();
    const target = elements.target;
    const popup = elements.popup;
    // Re-runs on resize/scroll and on target or popup size changes, which
    // the live rects read below do not track; and on an open-state change.
    void [
      windowDimensions.windowWidth,
      windowDimensions.windowHeight,
      windowDimensions.scrollWidth,
      windowDimensions.scrollHeight,
      targetSize.width,
      targetSize.height,
      popupSize.width,
      popupSize.height,
      isOpen,
    ];
    if (isServer || !target || !popup) return undefined;
    // Resolve logical → physical BEFORE findBestPosition so positionName
    // stays a physical direction.
    const physical = preferredDirections
      .map(toPlacement)
      .map((placement) => resolveLogicalPlacement(placement, direction));
    return findBestPosition(
      target.getBoundingClientRect(),
      popup.getBoundingClientRect(),
      physical,
      {
        distance,
        autoFit,
        bounds: computeBounds(
          gutter,
          windowDimensions.windowWidth,
          windowDimensions.windowHeight,
        ),
      },
    );
  });

  /**
   * The arrow offset that keeps an arrow pointing at the target centre,
   * computed for every placement. Consumers without an arrow ignore it.
   */
  const arrowOffset: ArrowOffset | undefined = $derived.by(() => {
    const target = elements.target;
    if (!bestPosition || !target) return undefined;
    // Use the SAME popup dimensions that drove this reposition (the observed
    // size), not a fresh live rect, so the arrow centres against the width
    // the position was computed from.
    const popupRect = {
      ...bestPosition.position,
      width: popupSize.width,
      height: popupSize.height,
    } as DOMRect;
    return computeArrowOffset(
      bestPosition.positionName,
      target.getBoundingClientRect(),
      popupRect,
      // Authoritative placement — avoids the one-frame lag of the live popup rect.
      bestPosition.position,
    );
  });

  /** The inline style declarations for the popup element. */
  const popupPositionStyle = $derived.by(() => {
    const { maxWidth = "350px" } = getProps();
    return [
      `max-width: ${maxWidth}`,
      `top: ${bestPosition?.position.top || 0}px`,
      `left: ${bestPosition?.position.left || 0}px`,
      // Fake margin around the popup, on the side facing the target, to
      // prevent a pointer-leave when moving from the target to the popup.
      `${fakeMarginProperty(bestPosition?.positionName)}: ${distance}px`,
    ].join("; ");
  });

  // Re-resolves the placement when the document's <html dir> flips (a
  // language toggle) with no size or scroll change. Reruns only when the
  // `direction` override is set or cleared: with an override nothing is
  // observed.
  $effect(() => {
    if (getProps().direction) return;
    const observer = new MutationObserver(() => {
      dirVersion += 1;
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => observer.disconnect();
  });

  let previousPositionName: string | undefined;
  // Notifies the consumer when the placement side changes. Reruns whenever
  // the best position is recomputed; only a new side calls back.
  $effect(() => {
    const position = bestPosition;
    if (position?.positionName === previousPositionName) return;
    previousPositionName = position?.positionName;
    getProps().onbestpositionchange?.(position);
  });

  return {
    get bestPosition() {
      return bestPosition;
    },
    get popupPositionStyle() {
      return popupPositionStyle;
    },
    get arrowOffset() {
      return arrowOffset;
    },
    get direction() {
      return direction;
    },
  };
}
