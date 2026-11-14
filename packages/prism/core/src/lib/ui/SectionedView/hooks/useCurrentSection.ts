import { useEffect, useState } from "react";
import {
  SCROLLING_OVERFLOWS,
  SECTION_LINE_TOLERANCE_PX,
} from "../constants.js";

/** Where a section's heading stands: its id and its top in the viewport. */
type HeadingTop = { readonly id: string; readonly top: number };

/**
 * Pick the current section: the last whose heading has reached the line,
 * else the first, since a reader above every heading is in the first.
 */
function pickCurrentSection(
  headings: readonly HeadingTop[],
  line: number,
): string | undefined {
  return headings.findLast(({ top }) => top <= line)?.id ?? headings.at(0)?.id;
}

/**
 * Find the nearest ancestor of `element` that scrolls its content, or
 * `null` when the document itself scrolls it.
 *
 * @note Impure: reads the computed styles of the element's ancestors.
 */
function findScroller(element: Element): Element | null {
  for (
    let ancestor = element.parentElement;
    ancestor !== null && ancestor !== document.body;
    ancestor = ancestor.parentElement
  ) {
    if (SCROLLING_OVERFLOWS.includes(getComputedStyle(ancestor).overflowY)) {
      return ancestor;
    }
  }
  return null;
}

/**
 * Follow the section the reader is in: the last section whose heading has
 * reached the line the headings stop at when a link scrolls to them (their
 * scroll container's top, plus their `scroll-margin-block-start`, the "On
 * this page" bar's height), else the first. One intersection observer
 * watches the headings cross that line; it finds them by the ids passed
 * and reads nothing else from the page.
 *
 * @param ids - The sections' ids, which are their headings' ids, in order.
 * @returns The current section's id; `undefined` on the server, before the
 *   first measure, and when no heading is on the page.
 * @note Impure: observes the page's headings once mounted.
 */
export default function useCurrentSection(
  ids: readonly string[],
): string | undefined {
  const [current, setCurrent] = useState<string | undefined>(undefined);
  const key = JSON.stringify(ids);

  useEffect(() => {
    const headings = (JSON.parse(key) as string[])
      .map((id) => document.getElementById(id))
      .filter((heading) => heading !== null);
    const first = headings.at(0);
    if (first === undefined || typeof IntersectionObserver === "undefined") {
      setCurrent(undefined);
      return;
    }
    const scroller = findScroller(first);
    const margin =
      Number.parseFloat(getComputedStyle(first).scrollMarginBlockStart) || 0;
    const offset = margin + SECTION_LINE_TOLERANCE_PX;
    const measure = (): void => {
      const top = scroller?.getBoundingClientRect().top ?? 0;
      setCurrent(
        pickCurrentSection(
          headings.map((heading) => ({
            id: heading.id,
            top: heading.getBoundingClientRect().top,
          })),
          top + offset,
        ),
      );
    };
    const observer = new IntersectionObserver(measure, {
      root: scroller,
      rootMargin: `-${offset}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [key]);

  return current;
}
