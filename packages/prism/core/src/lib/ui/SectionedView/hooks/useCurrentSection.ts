import { useEffect, useState } from "react";
import {
  SCROLLING_OVERFLOWS,
  SECTION_LINE_TOLERANCE_PX,
} from "../constants.js";

/** Where a section's heading stands: its id and its top in the viewport. */
type HeadingTop = { readonly id: string; readonly top: number };

/**
 * The section the reader chose with a link: its id and the scroll position
 * the link left the scroller at, unknown until the scroller next reports.
 */
type Choice = { readonly id: string; readonly at: number | undefined };

/**
 * Pick the current section: the last when the scroller is at its end, since
 * a section whose heading cannot reach the line is the one in view there;
 * else the last whose heading has reached the line, else the first, since a
 * reader above every heading is in the first.
 */
function pickCurrentSection(
  headings: readonly HeadingTop[],
  line: number,
  atEnd: boolean,
): string | undefined {
  return atEnd
    ? headings.at(-1)?.id
    : (headings.findLast(({ top }) => top <= line)?.id ?? headings.at(0)?.id);
}

/**
 * Tell whether a scroller that can scroll stands at its end; one that cannot
 * scroll stands at its start.
 */
function isAtEnd({ clientHeight, scrollHeight, scrollTop }: Element): boolean {
  return (
    scrollHeight - clientHeight > SECTION_LINE_TOLERANCE_PX &&
    scrollTop + clientHeight >= scrollHeight - SECTION_LINE_TOLERANCE_PX
  );
}

/**
 * Read the section a click chooses: the id a plain click on a link to
 * `#<id>` points at, when it is one of the ids followed.
 */
function readChoice(
  event: MouseEvent,
  ids: readonly string[],
): string | undefined {
  if (
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    !(event.target instanceof Element)
  ) {
    return undefined;
  }
  const href =
    event.target.closest("a[href^='#']")?.getAttribute("href") ?? "#";
  const id = href.slice(1);
  return ids.includes(id) ? id : undefined;
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
 * this page" bar's height), else the first; the last when the scroller is
 * at its end; and the section the reader chose with a link to it, until
 * the scroller moves from where that link left it. One intersection
 * observer watches the headings cross that line; it finds them by the ids
 * passed. The scroller's own scroll only tells when it reaches or leaves
 * its end or leaves a chosen section, and a click only which link was
 * followed.
 *
 * @param ids - The sections' ids, which are their headings' ids, in order.
 * @returns The current section's id; `undefined` on the server, before the
 *   first measure, and when no heading is on the page.
 * @note Impure: observes the page's headings, its scroller's scroll and
 *   the document's clicks once mounted.
 */
export default function useCurrentSection(
  ids: readonly string[],
): string | undefined {
  const [current, setCurrent] = useState<string | undefined>(undefined);
  const key = JSON.stringify(ids);

  useEffect(() => {
    const followed = JSON.parse(key) as string[];
    const headings = followed
      .map((id) => document.getElementById(id))
      .filter((heading) => heading !== null);
    const first = headings.at(0);
    if (first === undefined || typeof IntersectionObserver === "undefined") {
      setCurrent(undefined);
      return;
    }
    const scroller = findScroller(first);
    const scrolling = scroller ?? document.documentElement;
    const margin =
      Number.parseFloat(getComputedStyle(first).scrollMarginBlockStart) || 0;
    const offset = margin + SECTION_LINE_TOLERANCE_PX;
    let choice: Choice | undefined;
    let atEnd = isAtEnd(scrolling);
    const measure = (): void => {
      const at = scrolling.scrollTop;
      atEnd = isAtEnd(scrolling);
      if (choice !== undefined) {
        const left = choice.at ?? at;
        choice = { id: choice.id, at: left };
        if (Math.abs(at - left) <= SECTION_LINE_TOLERANCE_PX) {
          setCurrent(choice.id);
          return;
        }
        choice = undefined;
      }
      const top = scroller?.getBoundingClientRect().top ?? 0;
      setCurrent(
        pickCurrentSection(
          headings.map((heading) => ({
            id: heading.id,
            top: heading.getBoundingClientRect().top,
          })),
          top + offset,
          atEnd,
        ),
      );
    };
    const follow = (): void => {
      if (choice !== undefined || isAtEnd(scrolling) !== atEnd) measure();
    };
    const choose = (event: MouseEvent): void => {
      const id = readChoice(event, followed);
      if (id === undefined) return;
      choice = { id, at: undefined };
      setCurrent(id);
    };
    const observer = new IntersectionObserver(measure, {
      root: scroller,
      rootMargin: `-${offset}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    for (const heading of headings) observer.observe(heading);
    const scrollTarget = scroller ?? window;
    scrollTarget.addEventListener("scroll", follow, { passive: true });
    document.addEventListener("click", choose);
    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", follow);
      document.removeEventListener("click", choose);
    };
  }, [key]);

  return current;
}
