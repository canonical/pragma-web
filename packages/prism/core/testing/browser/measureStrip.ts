import type { StripMeasure } from "./types.js";

/**
 * Measure the page's mode strip and facet bar. It runs in the browser, so
 * it reads boxes and computed styles only, and it names nothing from
 * outside its own body: Playwright serialises it into the page.
 *
 * The groups are read by their `data-slot` on the strip, the count and the
 * search by theirs on the filtering group; the strip overflows when its
 * content is wider than its box. Every href on the page is read for the
 * retired `view=` parameter, which the renderers' `as=` replaced.
 *
 * The count is clipped when it, or anything inside it, is narrower than
 * its content; the trail's crumbs are its list items' texts.
 *
 * @returns The strip's height, the bar's, its groups' extents, where its
 *   content ends, the count's end, the search's width, whether it
 *   overflows, whether the count is clipped, the trail's crumbs, and the
 *   hrefs that still carry `view=`.
 * @note Impure: reads the page's document and its computed styles.
 */
export default function measureStrip(): StripMeasure {
  const strip = document.querySelector<HTMLElement>(
    '[data-region="mode-strip"]',
  );
  const bar = document.querySelector<HTMLElement>('[data-region="filter-bar"]');
  const readBox = (selector: string) => {
    const element = strip?.querySelector(`:scope ${selector}`);
    if (element === null || element === undefined) return null;
    const box = element.getBoundingClientRect();
    return { x: box.x, right: box.right };
  };
  const stripBox = strip?.getBoundingClientRect();
  const endPadding =
    strip === null || strip === undefined
      ? 0
      : Number.parseFloat(getComputedStyle(strip).paddingInlineEnd);
  const search = strip?.querySelector('[data-slot="search"]');
  const count = strip?.querySelector('[data-slot="count"]');
  const barBox = bar?.getBoundingClientRect();
  return {
    height: stripBox === undefined ? null : stripBox.height,
    bar: barBox === undefined || barBox.height === 0 ? null : barBox.height,
    groups: {
      trail: readBox('> [data-slot="trail"]'),
      view: readBox('> [data-slot="view"]'),
      filtering: readBox('> [data-slot="filtering"]'),
    },
    contentEnd: stripBox === undefined ? null : stripBox.right - endPadding,
    countRight:
      count === null || count === undefined
        ? null
        : count.getBoundingClientRect().right,
    searchWidth:
      search === null || search === undefined
        ? null
        : search.getBoundingClientRect().width,
    overflow:
      strip === null || strip === undefined
        ? false
        : strip.scrollWidth > strip.clientWidth,
    countClipped:
      count === null || count === undefined
        ? false
        : [count, ...count.querySelectorAll("*")].some(
            (element) => element.scrollWidth > element.clientWidth,
          ),
    crumbs: [...(strip?.querySelectorAll('[data-slot="trail"] li') ?? [])].map(
      (crumb) => crumb.textContent?.trim() ?? "",
    ),
    viewHrefs: [...document.querySelectorAll("a[href]")]
      .map((anchor) => anchor.getAttribute("href") ?? "")
      .filter((href) => /[?&]view=/.test(href)),
  };
}
