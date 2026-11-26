import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { UseChipLayoutProps, UseChipLayoutResult } from "./types.js";

/** The chips' list in the content row, which clips its own chips. */
const LIST_SELECTOR = ':scope > [role="list"]';

/**
 * Counts the chips in QueryInput's chips' list that do not fit on the
 * field's one line: those past the list's clipped edge, or on a
 * later row while the focused field wraps. Each such chip's item is marked
 * `data-clipped`, so the unfocused field takes a press on it. It measures
 * after each render, when the row or a chip changes size, when fonts load,
 * and when the host asks.
 *
 * @param props - The content row.
 * @returns The hidden count and the measure function.
 * @note Impure: reads layout, and observes the row's size.
 */
export default function useChipLayout({
  contentRef,
}: UseChipLayoutProps): UseChipLayoutResult {
  const [hiddenCount, setHiddenCount] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  // The count last set, so a measure that changes nothing sets no state.
  const countRef = useRef(0);

  const measure = useCallback(() => {
    const list = contentRef.current?.querySelector(LIST_SELECTOR);
    // Without a list there are no chips, so its edges matter to nothing.
    const row = list?.getBoundingClientRect() ?? { left: 0, right: 0 };
    const items = [...(list?.children ?? [])];
    const boxes = items.map((chip) => chip.getBoundingClientRect());
    // A later row starts at or below the first line's bottom: chips of
    // different heights share a line, centred on it.
    const firstTop = Math.min(...boxes.map((box) => box.top));
    const firstBottom = Math.min(...boxes.map((box) => box.bottom));
    const isOnLaterRow = (box: DOMRect): boolean =>
      box.top > firstTop && box.top >= firstBottom;
    const isHidden = (box: DOMRect): boolean =>
      box.right > row.right || box.left < row.left || isOnLaterRow(box);
    // A press on a clipped chip would wrap the field and move the chip
    // before the press ends, so the field takes it instead.
    let count = 0;
    items.forEach((item, index) => {
      const box = boxes.at(index);
      const isClipped = box !== undefined && isHidden(box);
      item.toggleAttribute("data-clipped", isClipped);
      if (isClipped) count += 1;
      // A chip that grows or shrinks, as when a web font arrives, is
      // measured again; observing an item twice does nothing.
      observerRef.current?.observe(item);
    });
    if (count === countRef.current) return;
    countRef.current = count;
    setHiddenCount(count);
  }, [contentRef]);

  useLayoutEffect(measure);

  useLayoutEffect(() => {
    const content = contentRef.current;
    // Without ResizeObserver, the row is measured on render only.
    if (!content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observerRef.current = observer;
    observer.observe(content);
    measure();
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [contentRef, measure]);

  // Fonts that load after the first render change every chip's width.
  // @note Impure: listens to the document's fonts.
  useLayoutEffect(() => {
    // jsdom, and older browsers, have no font set.
    const fonts = document.fonts as FontFaceSet | undefined;
    if (!fonts) return;
    fonts.addEventListener("loadingdone", measure);
    return () => fonts.removeEventListener("loadingdone", measure);
  }, [measure]);

  return { hiddenCount, measure };
}
