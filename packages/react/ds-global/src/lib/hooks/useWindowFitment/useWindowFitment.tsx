import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useResizeObserver } from "../useResizeObserver/index.js";
import { useWindowDimensions } from "../useWindowDimensions/index.js";
import type {
  ArrowOffset,
  BestPosition,
  PhysicalPlacement,
  RelativePosition,
  UseWindowFitmentProps,
  UseWindowFitmentResult,
  WindowFitmentAlign,
  WindowFitmentDirection,
  WindowFitmentPlacement,
  WindowFitmentSide,
} from "./types.js";
import {
  coercePlacement,
  computeArrowOffset,
  resolveLogicalPlacement,
} from "./utils/index.js";

/**
 * Read the document's writing direction from the root `<html>` element — the
 * single source of truth for the app's locale direction. Since the popup is
 * portalled under `<html>` too, both the positioning and any CSS keyed on
 * `html[dir="rtl"]` (e.g. a mirrored caret) agree without per-element reads.
 * @note Impure — reads the DOM. Defaults `ltr` on the server.
 */
const readHtmlDirection = (): "ltr" | "rtl" => {
  if (typeof document === "undefined") return "ltr";
  return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const DEFAULT_PREFERRED_DIRECTIONS: readonly (
  | WindowFitmentSide
  | WindowFitmentPlacement
)[] = ["block-start", "block-end", "inline-start", "inline-end"];

/**
 * Places a popup beside its target, in the first preferred direction that
 * fits the viewport.
 *
 * @param options The fitment options.
 * @returns The refs to attach, the best position, the popup's style, its
 *   arrow offset and the resolved direction.
 * @note Impure: measures the DOM and observes `<html dir>`.
 */
export default function useWindowFitment<
  TTarget extends HTMLElement = HTMLElement,
  TPopup extends HTMLElement = HTMLDivElement,
>(
  ...[options = {}]: UseWindowFitmentProps
): UseWindowFitmentResult<TTarget, TPopup> {
  const {
    preferredDirections = DEFAULT_PREFERRED_DIRECTIONS,
    distance = "0px",
    gutter = "0px",
    maxWidth = "350px",
    resizeDelay = 150,
    scrollDelay = 150,
    isOpen,
    onBestPositionChange,
    autoFit = false,
    direction: directionProp,
  } = options;
  const isServer = typeof window === "undefined";
  // Refs are created as the concrete `TTarget`/`TPopup` the caller asks for
  // (default `HTMLElement`/`HTMLDivElement`); internally they are only read via
  // `getBoundingClientRect()`, common to every element.
  const targetRef = useRef<TTarget | null>(null);
  const popupRef = useRef<TPopup | null>(null);
  const prevBestPosition = useRef<BestPosition | undefined>(undefined);
  // Track the committed DOM elements from `targetRef`/`popupRef` in state so
  // ref attachment/detachment (e.g. deferred portals or conditional popups)
  // triggers `useResizeObserver` and `bestPosition` even when rects are 0×0.
  const [targetElement, setTargetElement] = useState<TTarget | null>(null);
  const [popupElement, setPopupElement] = useState<TPopup | null>(null);
  // Bumped when the anchored element's `dir` flips with no layout change, so the
  // logical→physical resolution re-runs (see the MutationObserver effect below).
  const [dirVersion, setDirVersion] = useState(0);

  const windowDimensions = useWindowDimensions({ resizeDelay, scrollDelay });
  const targetSize = useResizeObserver(targetElement);
  const popupSize = useResizeObserver(popupElement);

  useIsomorphicLayoutEffect(() => {
    if (targetElement !== targetRef.current) {
      setTargetElement(targetRef.current);
    }
    if (popupElement !== popupRef.current) {
      setPopupElement(popupRef.current);
    }
  });

  /** The distance, in pixels, between the target and the popup. */
  const distanceAsPixelsNumber = useMemo(
    () => Number.parseInt(distance, 10) || 0,
    [distance],
  );

  /** The bounds of the window, accounting for the `gutter` prop. */
  const bounds = useMemo(() => {
    const gutterValues = gutter
      .split(" ")
      .map((val) => Number.parseInt(val, 10));
    const topGutter = gutterValues[0] || 0;
    const rightGutter = gutterValues[1] || gutterValues[0] || 0;
    const bottomGutter = gutterValues[2] || gutterValues[0] || 0;
    const leftGutter =
      gutterValues[3] || gutterValues[1] || gutterValues[0] || 0;

    return {
      top: topGutter,
      left: leftGutter,
      right: windowDimensions.windowWidth - rightGutter,
      bottom: windowDimensions.windowHeight - bottomGutter,
    };
  }, [gutter, windowDimensions]);

  /**
   * Calculate the relative position of the popup when oriented in a given direction.
   * @param direction The side of the target element to position the popup on.
   * @param targetRect The bounding client rect of the target element.
   * @param popupRect The bounding client rect of the popup element.
   * @returns The calculated relative position of the popup.
   */
  const calculateRelativePosition = useCallback(
    (
      direction: WindowFitmentDirection,
      align: WindowFitmentAlign,
      targetRect: DOMRect,
      popupRect: DOMRect,
    ): RelativePosition => {
      let left = 0;
      let top = 0;

      /*
        We use left and top offsets to position the popup relative to the target element.
        Then, we apply a margin on the opposite side of the popup to create a buffer zone between the target and the popup, to prevent a mouseleave event when moving from the target to the popup.
        The fake margin is already included in `targetRect` dimensions, as it is rendered hidden at least once before the popup is shown.
        In cases where `targetRect` is not included in the calculation, we add `distanceAsPixelsNumber` to account for the fake margin.
       */

      // Cross-axis offset along a side's cross-axis:
      //   start  → target's leading edge (offset 0)
      //   end    → target's trailing edge
      //   center → centred (legacy; identical to the pre-align formula)
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
          left = -(popupRect.width + distanceAsPixelsNumber);
          break;
      }

      // vertical offset
      switch (direction) {
        case "top":
          top = -(popupRect.height + distanceAsPixelsNumber);
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
    },
    [distanceAsPixelsNumber],
  );

  /**
   * Check if the popup fits within the window. Accounts for `gutter` prop.
   * @param candidatePosition The absolute position of the popup
   * @param popupRect The bounding client rect of the popup element.
   * @returns Whether the popup fits within the window.
   */
  const fitsInWindow = useCallback(
    (candidatePosition: RelativePosition, popupRect: DOMRect): boolean => {
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
    },
    [bounds],
  );

  /**
   * Find the best position for the popup based on the preferred directions.
   * @param targetRect The bounding client rect of the target element.
   * @param popupRect The bounding client rect of the popup element.
   * @returns The best absolute position for the popup.
   */
  const findBestPosition = useCallback(
    (
      targetRect: DOMRect,
      popupRect: DOMRect,
      placements: PhysicalPlacement[],
    ): BestPosition | undefined => {
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
        const naturallyFits = fitsInWindow(naturalPosition, popupRect);

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

        // No side fits naturally → this placement is a fallback candidate. Keep
        // the LEAST-clamped one (smallest total auto-fit offset) rather than
        // always taking the first: the placement that overflows the viewport
        // least sits closest to its ideal spot. (Note: this is the only useful
        // per-candidate signal here — the popup's own dimensions are the same for
        // every candidate in one pass, so a wide-vs-tall metric would be constant
        // and cannot break ties.)
        const candidate: BestPosition = {
          positionName: direction,
          align,
          position: absolutePosition,
          fits: false,
          autoFitOffset,
        };
        const clampCost =
          Math.abs(candidate.autoFitOffset.top) +
          Math.abs(candidate.autoFitOffset.left);
        if (!fallbackPosition || clampCost < fallbackScore) {
          fallbackPosition = candidate;
          fallbackScore = clampCost;
        }
      }

      return fallbackPosition as BestPosition;
    },
    [calculateRelativePosition, fitsInWindow, autoFit, bounds],
  );

  /** Normalise the mixed side/placement list once (bare side → centred). */
  const placements = useMemo(
    () => preferredDirections.map(coercePlacement),
    [preferredDirections],
  );

  /** The best possible position for the popup. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: dirVersion and isOpen are deliberate re-resolution triggers — the memo reads document.documentElement.dir and live DOM rects (not tracked by React).
  const bestPosition: BestPosition | undefined = useMemo(() => {
    if (
      !isServer &&
      targetElement &&
      popupElement &&
      windowDimensions &&
      popupSize &&
      targetSize
    ) {
      // Resolve logical → physical BEFORE findBestPosition so positionName stays
      // a physical direction. The direction is the `direction` override if given,
      // else the document's <html dir>. Re-runs on resize/scroll/content (deps),
      // on ref attachment or open-state changes (targetElement, popupElement,
      // isOpen), and on an <html dir> flip (dirVersion, from the observer below).
      const dir = directionProp ?? readHtmlDirection();
      const physical = placements.map((p) => resolveLogicalPlacement(p, dir));
      return findBestPosition(
        targetElement.getBoundingClientRect(),
        popupElement.getBoundingClientRect(),
        physical,
      );
    }
  }, [
    findBestPosition,
    placements,
    windowDimensions,
    popupSize,
    targetSize,
    targetElement,
    popupElement,
    isServer,
    directionProp,
    dirVersion,
    isOpen,
  ]);

  // Re-resolve when the document's <html dir> flips (a language toggle) with no
  // size/scroll change. A single observer on the root — the one source of truth.
  useEffect(() => {
    // Effects never run on the server.
    if (directionProp) return;
    const observer = new MutationObserver(() => setDirVersion((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => observer.disconnect();
  }, [directionProp]);

  /**
   * The arrow offset that keeps an arrow pointing at the target centre, computed
   * for every placement (not only when auto-fit clamps). Consumers without an
   * arrow ignore it.
   */
  const arrowOffset: ArrowOffset | undefined = useMemo(() => {
    if (
      isServer ||
      !bestPosition ||
      !targetElement ||
      !popupElement ||
      !targetSize ||
      !popupSize
    )
      return;
    // Use the SAME popup dimensions that drove this reposition (popupSize, the
    // observed size that `bestPosition` was recomputed from), not a fresh live
    // rect — otherwise the width the arrow centres against can differ from the
    // width the position was computed against, and the apex drifts a few px.
    // The width/height are all `computeArrowOffset` reads off the popup rect.
    const popupRect = {
      ...bestPosition.position,
      width: popupSize.width,
      height: popupSize.height,
    } as DOMRect;
    return computeArrowOffset(
      bestPosition.positionName,
      targetElement.getBoundingClientRect(),
      popupRect,
      // Authoritative placement — avoids the one-frame lag of the live popup rect.
      bestPosition.position,
    );
  }, [
    bestPosition,
    isServer,
    targetElement,
    popupElement,
    targetSize,
    popupSize,
  ]);

  /** Notify the consumer when the best position changes. */
  useEffect(() => {
    if (bestPosition?.positionName !== prevBestPosition.current?.positionName) {
      prevBestPosition.current = bestPosition;
      if (onBestPositionChange) onBestPositionChange(bestPosition);
    }
  }, [bestPosition, onBestPositionChange]);

  const fakeMargin = useMemo(() => {
    let side = "Top";
    switch (bestPosition?.positionName) {
      case "top":
        side = "Bottom";
        break;
      case "bottom":
        side = "Top";
        break;
      case "left":
        side = "Right";
        break;
      case "right":
        side = "Left";
        break;
    }
    return {
      [`margin${side}`]: `${distanceAsPixelsNumber}px`,
    };
  }, [bestPosition, distanceAsPixelsNumber]);

  /** The style object to be applied to the popup element. */
  const popupPositionStyle: CSSProperties = useMemo(
    () => ({
      maxWidth: maxWidth,
      top: bestPosition?.position?.top || 0,
      left: bestPosition?.position?.left || 0,
      // Fake margin around the popup to prevent a mouseleave event when moving from the target to the popup.
      ...fakeMargin,
    }),
    [bestPosition, maxWidth, fakeMargin],
  );

  // The resolved writing direction — the `direction` override, else <html dir>.
  // Exposed so a portalled popup can set `dir` on itself and any CSS keyed on
  // `[dir="rtl"]` (e.g. a mirrored caret) works despite the portal.
  // biome-ignore lint/correctness/useExhaustiveDependencies: dirVersion is a deliberate re-resolution trigger for the untracked document.documentElement.dir read.
  const direction = useMemo(
    () => directionProp ?? readHtmlDirection(),
    [directionProp, dirVersion],
  );

  return {
    targetRef,
    popupRef,
    bestPosition,
    popupPositionStyle,
    arrowOffset,
    direction,
  };
}
