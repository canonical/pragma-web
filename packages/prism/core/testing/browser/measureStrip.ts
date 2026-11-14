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
 * its content. A group is painted where its descendants' boxes are, each
 * cut by every element up to the group that clips or scrolls it, so a
 * group that spills toward the start shows over its neighbour even though
 * the strip itself does not overflow. Each crumb is its list item's own
 * text, without the separator the item hides from assistive technology.
 * A count that is not displayed has no end. The facet bar overflows when
 * it, or its controls, is narrower than its content; its controls end
 * where the rightmost box inside them does, so controls that spill past
 * the band on one line are seen even though the bar keeps its height.
 *
 * @returns The strip's height, the bar's, its groups' extents, where its
 *   content ends, the count's end, the search's width, whether it
 *   overflows, whether the count is clipped, which groups are painted over
 *   one another, the trail's crumbs, the hrefs that still carry `view=`,
 *   whether the bar overflows and where its controls end.
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
  const controls = bar?.querySelector<HTMLElement>(":scope > .controls");
  const controlRights = [...(controls?.querySelectorAll("*") ?? [])]
    .map((element) => element.getBoundingClientRect())
    .filter((box) => box.width > 0 && box.height > 0)
    .map((box) => box.right);
  const clipping = ["auto", "scroll", "hidden", "clip"];
  const readPainted = (name: string) => {
    const group = strip?.querySelector<HTMLElement>(
      `:scope > [data-slot="${name}"]`,
    );
    if (group === null || group === undefined) return null;
    const extents = [...group.querySelectorAll("*")].flatMap((element) => {
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return [];
      let x = box.x;
      let right = box.right;
      for (
        let ancestor = element.parentElement;
        ancestor !== null && group.contains(ancestor);
        ancestor = ancestor.parentElement
      ) {
        if (clipping.includes(getComputedStyle(ancestor).overflowX)) {
          const clip = ancestor.getBoundingClientRect();
          x = Math.max(x, clip.x);
          right = Math.min(right, clip.right);
        }
      }
      return right > x ? [{ x, right }] : [];
    });
    return extents.length === 0
      ? null
      : {
          x: Math.min(...extents.map((extent) => extent.x)),
          right: Math.max(...extents.map((extent) => extent.right)),
        };
  };
  const painted = ["trail", "view", "filtering"].map((name) => ({
    name,
    box: readPainted(name),
  }));
  const overlaps = painted.flatMap((first, index) =>
    painted.slice(index + 1).flatMap((second) => {
      if (first.box === null || second.box === null) return [];
      const shared =
        Math.min(first.box.right, second.box.right) -
        Math.max(first.box.x, second.box.x);
      return shared > 0.5
        ? [`${first.name}/${second.name} ${shared.toFixed(1)}px`]
        : [];
    }),
  );
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
      count === null || count === undefined || count.getClientRects().length === 0
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
    overlaps,
    crumbs: [...(strip?.querySelectorAll('[data-slot="trail"] li') ?? [])].map(
      (crumb) =>
        [...crumb.children]
          .filter((part) => part.getAttribute("aria-hidden") !== "true")
          .map((part) => part.textContent ?? "")
          .join("")
          .trim(),
    ),
    viewHrefs: [...document.querySelectorAll("a[href]")]
      .map((anchor) => anchor.getAttribute("href") ?? "")
      .filter((href) => /[?&]view=/.test(href)),
    barOverflow: [bar, controls].some(
      (element) =>
        element !== null &&
        element !== undefined &&
        element.scrollWidth > element.clientWidth,
    ),
    controlsRight:
      controlRights.length === 0 ? null : Math.max(...controlRights),
  };
}
