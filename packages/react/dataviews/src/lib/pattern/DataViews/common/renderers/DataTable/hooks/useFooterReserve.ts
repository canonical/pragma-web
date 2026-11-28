import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { useLayoutEffect } from "react";
import type { UseFooterReserveProps } from "./types.js";

/** The frame's custom property the footer's measured height is written to. */
const RESERVE = "--data-table-frame-footer-reserve";

/**
 * Writes the footer's border-box height onto the frame, inline, as the
 * reserve the stylesheet keeps clear of it: the bounded cap and the scroll
 * margin of what takes focus. Before scripts run, or without a
 * `ResizeObserver`, the stylesheet's own reserve stands.
 *
 * @note Impure: observes the footer's size and writes the frame's style
 * until the footer goes or the table unmounts.
 */
export default function useFooterReserve(
  ...[frame, footer, drawn]: UseFooterReserveProps
): void {
  useLayoutEffect(() => {
    const frameElement = frame.current;
    const footerElement = footer.current;
    if (
      !drawn ||
      frameElement === null ||
      footerElement === null ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const box = assertInvariant(
        entry?.borderBoxSize.at(0),
        "a border box for the observed footer",
      );
      frameElement.style.setProperty(RESERVE, `${box.blockSize}px`);
    });
    observer.observe(footerElement);
    return () => {
      observer.disconnect();
      frameElement.style.removeProperty(RESERVE);
    };
  }, [frame, footer, drawn]);
}
