import { useEffect, useRef, useState } from "react";
import { useStableCallback } from "../../../../../hooks/index.js";
import { NARROW_WIDTH_REM } from "../constants.js";
import type { UseNarrowModeProps, UseNarrowModeResult } from "./types.js";

/** The size of a rem in pixels, as the document's root sets it. */
const readRemPx = (document: Document): number =>
  Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

/**
 * Whether the bar's container is narrow, below the width its container
 * query hides the chips at, and the moves the query cannot make: as the bar
 * narrows, the stop leaves the hidden chips for the entry, and focus that
 * was in a chip, or dropped from one as the chips were hidden, moves to
 * the entry, so neither rests on a hidden item; widening again is told
 * too, once the bar has been narrow. The
 * stylesheet hides the chips; this only follows the same width, through a
 * `ResizeObserver`, which reports at most once a frame.
 *
 * @param props - The bar's root and entry, and what moves the stop off the
 *   chips.
 * @returns Whether the bar is narrow; false until a size is reported.
 * @note Impure: observes the root's size, and moves focus.
 */
export default function useNarrowMode({
  rootRef,
  entryRef,
  onNarrow,
  onWide,
}: UseNarrowModeProps): UseNarrowModeResult {
  const [isNarrow, setNarrow] = useState(false);
  const leaveChips = useStableCallback(onNarrow);
  const returnToChips = useStableCallback(onWide);
  // Whether the bar has been narrow, so widening is told from the start.
  const wasNarrowRef = useRef(false);
  // Whether focus last went into a chip: a browser drops the focus of an
  // element the container query hides before the bar hears of the width.
  const wasInChipsRef = useRef(false);

  // @note Impure: listens to the document's focus.
  useEffect(() => {
    const document = rootRef.current?.ownerDocument;
    /* v8 ignore next -- unreachable: the root renders before its effects run */
    if (document === undefined) return;
    const isInChips = (target: EventTarget | null): boolean =>
      rootRef.current
        ?.querySelector(".ds.query-chips")
        ?.contains(target as Node) === true;
    const handleFocusIn = (event: FocusEvent): void => {
      wasInChipsRef.current = isInChips(event.target);
    };
    // A press elsewhere, as on the page's blank space, takes focus out of
    // the chips with no focus arriving anywhere.
    const handlePointerDown = (event: PointerEvent): void => {
      if (!isInChips(event.target)) wasInChipsRef.current = false;
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
    if (!isNarrow) {
      if (wasNarrowRef.current) returnToChips();
      wasNarrowRef.current = false;
      return;
    }
    wasNarrowRef.current = true;
    const { activeElement, body } = root.ownerDocument;
    const chips = root.querySelector(".ds.query-chips");
    // In a chip still, or dropped to the page from one as it was hidden.
    const hadFocus =
      chips?.contains(activeElement) === true ||
      (activeElement === body && wasInChipsRef.current);
    leaveChips();
    if (hadFocus) entryRef.current?.focus();
  }, [isNarrow, rootRef, entryRef, leaveChips, returnToChips]);

  return isNarrow;
}
