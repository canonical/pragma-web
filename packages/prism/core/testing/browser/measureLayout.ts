import type { LayoutMeasure, MeasureLayoutOptions } from "./types.js";

/**
 * Measure the layout of the page in the tab. It runs in the browser, so it
 * reads computed styles and boxes only, and it names nothing from outside
 * its own body: Playwright serialises it into the page.
 *
 * Overflow is read where it would show, not off the document: the shell
 * clips its content, so the document's own scroll width never exceeds the
 * viewport. Instead the shell's content width, each region's content width,
 * and every element's box are compared with the space they have, and an
 * element is excused only by an element of its own that scrolls or clips
 * it, such as a code block that scrolls sideways, never by a region or the
 * shell.
 *
 * The chrome's spacing excludes what resolves to a measure rather than a
 * choice: an auto margin, which takes the free space, and the typography
 * engine's baseline nudges on text blocks.
 *
 * @param options - The selectors, the spacing step and the overflow rules.
 * @returns The page's grids, scrollers, overflow and spacing.
 * @note Impure: reads the page's document and its computed styles.
 */
export default function measureLayout({
  chromeSelector,
  regionSelector,
  step,
  tolerance,
  clippingOverflows,
}: MeasureLayoutOptions): LayoutMeasure {
  const describe = (element: Element): string =>
    `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`;
  const grids = [...document.querySelectorAll(".grid.intrinsic")].map(
    (grid) => {
      const style = getComputedStyle(grid);
      return {
        className: grid.className,
        containerName: style.containerName,
        columns: style.gridTemplateColumns.split(" ").length,
      };
    },
  );

  const shell = document.querySelector(".ds.shell");
  const regions = new Set(document.querySelectorAll(regionSelector));
  const isExcused = (element: Element): boolean => {
    for (
      let ancestor = element.parentElement;
      ancestor !== null && ancestor !== shell;
      ancestor = ancestor.parentElement
    ) {
      if (regions.has(ancestor)) continue;
      if (clippingOverflows.includes(getComputedStyle(ancestor).overflowX)) {
        return true;
      }
    }
    return false;
  };
  const overflow = [
    ...(shell !== null && shell.scrollWidth > shell.clientWidth
      ? [`${describe(shell)} right=${shell.scrollWidth}`]
      : []),
    ...[...regions]
      .filter((region) => region.scrollWidth > region.clientWidth)
      .map((region) => `${describe(region)} right=${region.scrollWidth}`),
    ...[...document.querySelectorAll("body *")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return (
          box.width > 0 &&
          box.height > 0 &&
          box.right > window.innerWidth + tolerance &&
          !isExcused(element)
        );
      })
      .map(
        (element) =>
          `${describe(element)} right=${element.getBoundingClientRect().right}`,
      ),
  ];

  const scrollers = [...document.querySelectorAll("body *")]
    .filter((element) => {
      const { overflowY } = getComputedStyle(element);
      return (
        (overflowY === "auto" || overflowY === "scroll") &&
        element.scrollHeight > element.clientHeight
      );
    })
    .map(describe);
  const canvas = document.querySelector("main.ds.canvas");
  const readOverflow = (selector: string): string | null => {
    const region = document.querySelector(selector);
    return region === null ? null : getComputedStyle(region).overflowY;
  };
  const trigger = document.querySelector(".inspector-trigger");

  const histogram: Record<string, number> = {};
  const offGrid: string[] = [];
  const properties = [
    "row-gap",
    "column-gap",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
  ];
  for (const element of document.querySelectorAll(chromeSelector)) {
    const style = getComputedStyle(element);
    const isTextBlock = element.matches("p, .p, .code, h1, h2, h3, h4, h5, h6");
    const hasAutoMargin = element.matches(".kbd, .inspector-trigger");
    for (const property of properties) {
      if (isTextBlock && /^padding-(top|bottom)$/.test(property)) continue;
      if (hasAutoMargin && /^margin-(left|right)$/.test(property)) continue;
      const value = style.getPropertyValue(property);
      if (!value.endsWith("px")) continue;
      const pixels = Number.parseFloat(value);
      histogram[value] = (histogram[value] ?? 0) + 1;
      if (Math.abs(pixels / step - Math.round(pixels / step)) > 0.01) {
        offGrid.push(`${describe(element)} ${property}: ${value}`);
      }
    }
  }

  return {
    grids,
    page: {
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
    },
    overflow,
    scrollers,
    canvas: {
      overflow: canvas === null ? "" : getComputedStyle(canvas).overflow,
      scrollHeight: canvas?.scrollHeight ?? -1,
      clientHeight: canvas?.clientHeight ?? -1,
    },
    regionOverflow: {
      rail: readOverflow(
        ":is(.ds.workspace-layout, .ds.document-layout) > .rail",
      ),
      inspector: readOverflow(".ds.workspace-layout > .inspector"),
    },
    triggerShown:
      trigger !== null && getComputedStyle(trigger).display !== "none",
    histogram,
    offGrid,
  };
}
