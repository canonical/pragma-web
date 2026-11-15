import type { PeekMeasure } from "./types.js";

/**
 * Measure the first chip `selector` finds and the peek open on the
 * document's body. It runs in the browser and names nothing from outside
 * its own body: Playwright serialises it into the page.
 *
 * A link of the peek is live when it is drawn and is, or holds, the
 * topmost element at its centre, so a pointer reaches it.
 *
 * @param selector - The chip's root.
 * @returns The chip's box, the peek's box (or `null` when no peek is
 *   shown), the viewport, the peek's role, whether it sits in a link, its
 *   live links, whether focus is on the chip's link, and what `watchPeek`
 *   recorded.
 * @note Impure: reads the page's document and layout.
 */
export default function measurePeek(selector: string): PeekMeasure {
  const chip = document.querySelector(selector);
  if (chip === null) throw new Error(`no chip matches ${selector}`);
  const edges = (box: DOMRect) => ({
    top: box.top,
    right: box.right,
    bottom: box.bottom,
    left: box.left,
  });
  const found = document.querySelector("body > .ds.peek");
  const box = found?.getBoundingClientRect();
  const peek =
    found === null || box === undefined || box.width === 0 ? null : found;
  const isLive = (link: Element): boolean => {
    const linkBox = link.getBoundingClientRect();
    if (linkBox.width === 0 || linkBox.height === 0) return false;
    const top = document.elementFromPoint(
      linkBox.left + linkBox.width / 2,
      linkBox.top + linkBox.height / 2,
    );
    return top !== null && link.contains(top);
  };
  return {
    chip: edges(chip.getBoundingClientRect()),
    peek:
      peek === null || box === undefined
        ? null
        : { ...edges(box), width: box.width, height: box.height },
    viewport: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
    role: peek?.getAttribute("role") ?? null,
    inLink: peek?.closest("a") != null,
    liveLinks:
      peek === null
        ? []
        : [...peek.querySelectorAll("a[href]")]
            .filter(isLive)
            .map((link) => link.getAttribute("href") ?? ""),
    chipLinkFocused:
      document.activeElement !== null &&
      document.activeElement === chip.querySelector(":scope > [href]"),
    times: Reflect.get(window, "__prismPeekTimes") ?? {},
  };
}
