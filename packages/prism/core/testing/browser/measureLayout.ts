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
 * shell. The frame excuses nothing: an element of the strip that scrolls
 * sideways is itself an overflow, since the controls it cuts can only be
 * reached by scrolling a strip a phone's width wide, and an element of the
 * strip that reaches past the viewport is one even where an ancestor clips
 * it, since a crumb cut off at the strip's end loses its text without a
 * sign: what the strip holds must shrink inside it.
 *
 * A lens's breadcrumb trail is read for the rows its crumbs take and for
 * where its current crumb's text is painted: the text's own extent, cut by
 * every element of the trail that clips it, so a text that runs past its
 * crumb unclipped shows even where the strip would hide it.
 *
 * The chrome's spacing excludes what resolves to a measure rather than a
 * choice: an auto margin, which takes the free space, and the typography
 * engine's baseline nudges on text blocks and on the published button.
 *
 * @param options - The selectors, the spacing step and the overflow rules.
 * @returns The page's grids, scrollers, overflow, canvas page, edges,
 *   bands, trails and spacing.
 * @note Impure: reads the page's document and its computed styles.
 */
export default function measureLayout({
  chromeSelector,
  regionSelector,
  frameSelector,
  bandSelector,
  fillSelector,
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
  const frames = [...document.querySelectorAll(frameSelector)];
  const isExcused = (element: Element): boolean => {
    if (frames.some((frame) => frame.contains(element))) return false;
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
    ...[...document.querySelectorAll(frameSelector)]
      .flatMap((frame) => [frame, ...frame.querySelectorAll("*")])
      .filter((element) => {
        const { overflowX } = getComputedStyle(element);
        return (
          (overflowX === "auto" || overflowX === "scroll") &&
          element.scrollWidth > element.clientWidth
        );
      })
      .map((element) => `${describe(element)} scrolls=${element.scrollWidth}`),
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
  const canvasPage = document.querySelector("main.ds.canvas > .page");
  const pageBox = canvasPage?.getBoundingClientRect();
  const fillBoxes =
    fillSelector === undefined || canvasPage === null
      ? []
      : [...canvasPage.querySelectorAll(fillSelector)].map((element) =>
          element.getBoundingClientRect(),
        );

  const layout = document.querySelector(
    ".ds.workspace-layout, .ds.document-layout",
  );
  const rail = layout?.querySelector(":scope > .rail");
  const strip = layout?.querySelector(":scope > .strip");
  const canvasBox = canvas?.getBoundingClientRect();
  const canvasStyle = canvas === null ? null : getComputedStyle(canvas);
  const readPaddingBox = (element: Element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      start: box.left + Number.parseFloat(style.borderLeftWidth),
      end: box.right - Number.parseFloat(style.borderRightWidth),
    };
  };
  const bands = [...document.querySelectorAll(bandSelector)].map((band) => {
    const box = band.getBoundingClientRect();
    const style = getComputedStyle(band);
    let paintedStart = box.left;
    let paintedEnd = box.right;
    for (
      let ancestor = band.parentElement;
      ancestor !== null;
      ancestor = ancestor.parentElement
    ) {
      if (clippingOverflows.includes(getComputedStyle(ancestor).overflowX)) {
        const clip = readPaddingBox(ancestor);
        paintedStart = Math.max(paintedStart, clip.start);
        paintedEnd = Math.min(paintedEnd, clip.end);
      }
    }
    return {
      element: describe(band),
      start: box.left,
      end: box.right,
      paintedStart,
      paintedEnd,
      contentStart:
        box.left +
        Number.parseFloat(style.borderLeftWidth) +
        Number.parseFloat(style.paddingLeft),
      contentEnd:
        box.right -
        Number.parseFloat(style.borderRightWidth) -
        Number.parseFloat(style.paddingRight),
    };
  });

  const trails = [...document.querySelectorAll(".ds.lens-breadcrumbs")].map(
    (trail) => {
      const itemTops = new Set(
        [...trail.querySelectorAll(".breadcrumbs-item")].map((item) =>
          Math.round(item.getBoundingClientRect().top),
        ),
      );
      const current = trail.querySelector('.link[aria-current="page"]');
      let textEnd = -1;
      if (current !== null) {
        const range = document.createRange();
        range.selectNodeContents(current);
        textEnd = range.getBoundingClientRect().right;
        for (
          let element: Element | null = current;
          element !== null && trail.contains(element);
          element = element.parentElement
        ) {
          if (clippingOverflows.includes(getComputedStyle(element).overflowX)) {
            textEnd = Math.min(textEnd, readPaddingBox(element).end);
          }
        }
      }
      return {
        element: describe(trail),
        rows: itemTops.size,
        textEnd,
        end: trail.getBoundingClientRect().right,
      };
    },
  );

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
    // The published button nudges its label onto the baseline grid with
    // its block padding, as the engine nudges a text block.
    const isTextBlock = element.matches(
      "p, .p, .code, h1, h2, h3, h4, h5, h6, .ds.button",
    );
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
    edges: {
      railEnd: rail?.getBoundingClientRect().right ?? -1,
      canvasStart:
        canvasBox === undefined || canvasStyle === null
          ? -1
          : canvasBox.left +
            Number.parseFloat(canvasStyle.borderLeftWidth) +
            Number.parseFloat(canvasStyle.paddingLeft),
      canvasTop: canvasBox?.top ?? -1,
      stripBottom: strip?.getBoundingClientRect().bottom ?? null,
      triggerBottom:
        trigger === null || getComputedStyle(trigger).display === "none"
          ? null
          : trigger.getBoundingClientRect().bottom,
      rowGap:
        layout === null
          ? -1
          : Number.parseFloat(getComputedStyle(layout).rowGap),
    },
    bands,
    trails,
    regionOverflow: {
      rail: readOverflow(
        ":is(.ds.workspace-layout, .ds.document-layout) > .rail",
      ),
      inspector: readOverflow(".ds.workspace-layout > .inspector"),
    },
    canvasPage: {
      width: pageBox?.width ?? -1,
      columnGap:
        canvasPage === null
          ? -1
          : Number.parseFloat(getComputedStyle(canvasPage).columnGap),
      firstChildWidth:
        canvasPage?.firstElementChild?.getBoundingClientRect().width ?? -1,
      firstChildTop:
        canvasPage?.firstElementChild?.getBoundingClientRect().top ?? -1,
      fillShortfall:
        pageBox === undefined || fillBoxes.length === 0
          ? null
          : {
              start:
                Math.min(...fillBoxes.map(({ left }) => left)) - pageBox.left,
              end:
                pageBox.right -
                Math.max(...fillBoxes.map(({ right }) => right)),
            },
    },
    triggerShown:
      trigger !== null && getComputedStyle(trigger).display !== "none",
    histogram,
    offGrid,
  };
}
