import { useEffect, useRef, useState } from "react";
import { useStableCallback } from "../../../../../../hooks/index.js";
import { NARROW_WIDTH_REM } from "../constants.js";
import type { UseNarrowModeProps, UseNarrowModeResult } from "./types.js";

/** An area of the bar one width hides: the chips, or the narrow form's. */
type HiddenArea = "chips" | "narrow";

/** Each area's elements: the chips, and the summary that stands in for them. */
const AREAS: Readonly<Record<HiddenArea, string>> = {
  chips: ".ds.query-chips",
  narrow: ":scope > .summary",
};

/** The size of a rem in pixels, as the document's root sets it. */
const readRemPx = (document: Document): number =>
  Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

/**
 * Whether the bar's container is narrow, below the width its container
 * query hides the chips at, and the moves the query cannot make: as the bar
 * narrows, the stop leaves the hidden chips for the entry, and focus that
 * was in a chip, or dropped from one as the chips were hidden, moves to
 * the entry, so neither rests on a hidden item. As it widens again, once
 * it has been narrow, focus on the summary, or dropped from it, moves to
 * the entry likewise. The
 * stylesheet hides the chips; this only follows the same width, through a
 * `ResizeObserver`, which reports at most once a frame.
 *
 * @returns Whether the bar is narrow; false until a size is reported.
 * @note Impure: observes the root's size, and moves focus.
 */
export default function useNarrowMode(
  ...[rootRef, entryRef, onNarrow, onWide]: UseNarrowModeProps
): UseNarrowModeResult {
  const [isNarrow, setNarrow] = useState(false);
  const leaveChips = useStableCallback(onNarrow);
  const returnToChips = useStableCallback(onWide);
  // Whether the bar has been narrow, so widening is told from the start.
  const wasNarrowRef = useRef(false);
  // Where focus last went among the items one width hides: a browser
  // drops the focus of an element the container query hides before the
  // bar hears of the width.
  const lastAreaRef = useRef<HiddenArea | null>(null);

  // @note Impure: listens to the document's focus.
  useEffect(() => {
    const document = rootRef.current?.ownerDocument;
    /* v8 ignore next -- unreachable: the root renders before its effects run */
    if (document === undefined) return;
    const readArea = (target: EventTarget | null): HiddenArea | null => {
      const root = rootRef.current;
      /* v8 ignore next -- unreachable: listened to only while the root renders */
      if (root === null) return null;
      return (
        (Object.keys(AREAS) as HiddenArea[]).find(
          (area) =>
            root.querySelector(AREAS[area])?.contains(target as Node) === true,
        ) ?? null
      );
    };
    const handleFocusIn = (event: FocusEvent): void => {
      lastAreaRef.current = readArea(event.target);
    };
    // A press elsewhere, as on the page's blank space, takes focus out of
    // the area with no focus arriving anywhere.
    const handlePointerDown = (event: PointerEvent): void => {
      if (readArea(event.target) !== lastAreaRef.current) {
        lastAreaRef.current = null;
      }
    };
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    /* v8 ignore next -- unreachable: the root renders before its effects run */
    if (root === null) return;
    const observer = new ResizeObserver((entries) => {
      for (const { contentRect } of entries) {
        setNarrow(
          contentRect.width < NARROW_WIDTH_REM * readRemPx(root.ownerDocument),
        );
      }
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    /* v8 ignore next -- unreachable: the root renders before its effects run */
    if (root === null) return;
    // What this width hides: the chips when narrow, the summary when wide.
    const hidden: HiddenArea = isNarrow ? "chips" : "narrow";
    const { activeElement, body } = root.ownerDocument;
    // In a hidden item still, or dropped to the page from one it hid.
    const hadFocus =
      root.querySelector(AREAS[hidden])?.contains(activeElement) === true ||
      (activeElement === body && lastAreaRef.current === hidden);
    if (!isNarrow) {
      const wasNarrow = wasNarrowRef.current;
      wasNarrowRef.current = false;
      if (!wasNarrow) return;
      returnToChips();
      if (hadFocus) entryRef.current?.focus();
      return;
    }
    wasNarrowRef.current = true;
    leaveChips();
    if (hadFocus) entryRef.current?.focus();
  }, [isNarrow, rootRef, entryRef, leaveChips, returnToChips]);

  return isNarrow;
}
