// @vitest-environment node

/**
 * The archetypes' reflow, laid out by a real browser: a workspace with an
 * inspector and a document with an aside, server-rendered into a page that
 * carries the layer order, the spacing shim, the grid presets, the design
 * tokens and the core stylesheets, inside a stand-in for a site's shell.
 * Chromium lays each out at 1440px, 1000px and 390px. What is asserted is
 * what the container queries promise: which region shows, whether the
 * drawer's trigger shows, which columns the canvas spans, where the aside
 * sits, that it scrolls with the page and that every entry of an aside
 * taller than the viewport can be scrolled into view, the gutter between
 * the rows, that a document with no colophon ends its canvas flush with
 * the viewport, that a layout with no strip starts its canvas flush with
 * the viewport's top, that a page's tiles fill their rows to the canvas's
 * end, that the strip's and the colophon's bands run from the rail's
 * border to the viewport's edge with their content between the canvas's
 * first column line and its last, painted over that whole width, that a
 * band of a document's page that bleeds across the gutter is painted to
 * the rail's border rather than clipped by the canvas's scroll, that a
 * trail whose one crumb is wider than the strip stays on one line and
 * ends in an ellipsis inside it, its text clipped by its own crumb, its
 * entity's address never drawn as a crumb, and that
 * nothing reaches past the viewport.
 */

import {
  createMemoryAdapter,
  createRouter,
  type RouteMap,
  route,
} from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { Browser, Page } from "playwright";
import type { ReactElement } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CANVAS_PAGE_TILE_CLASS_NAME,
  DocumentLayout,
  LensBreadcrumbs,
  ModeStrip,
  WorkspaceLayout,
} from "../../src/lib/ui/index.js";
import {
  BAND_SELECTOR,
  FRAME_SELECTOR,
  type LayoutMeasure,
  launchBrowser,
  type MeasureLayoutOptions,
  measureLayout,
} from "../../testing/browser/index.js";
import {
  ABSOLUTE_IRI,
  ARCHETYPE_VIEWPORTS,
  COMPONENT_STYLESHEETS,
  LONG_LENS_LABEL,
  PAGE_BAND_CLASS_NAME,
  SCROLL_PX,
} from "./constants.js";
import { readStylesheets, renderPage } from "./serverPage.js";

/** Paragraphs enough to scroll a document's canvas. */
const PARAGRAPHS = Array.from(
  { length: 60 },
  (_, index) => `Paragraph ${index + 1}.`,
);

/** Entries enough to make the aside taller than every viewport. */
const ASIDE_ENTRIES = Array.from(
  { length: 60 },
  (_, index) => `Section ${index + 1}`,
);

/** What `measureLayout` is asked to read on these pages. */
const MEASURE_OPTIONS: MeasureLayoutOptions = {
  chromeSelector: ".ds.shell",
  regionSelector: [
    ".ds.workspace-layout > *",
    ".ds.document-layout > *",
    "main.ds.canvas",
  ].join(", "),
  frameSelector: FRAME_SELECTOR,
  bandSelector: BAND_SELECTOR,
  step: 4,
  tolerance: 0.5,
  clippingOverflows: ["auto", "scroll", "hidden", "clip"],
};

/** A workspace with every region claimed. */
const workspaceLayout = (
  <WorkspaceLayout
    inspector={<p>Inspector</p>}
    rail={<nav aria-label="Rail">Rail</nav>}
    strip={<ModeStrip trail="Workspace" />}
  >
    <p>Canvas</p>
  </WorkspaceLayout>
);

/**
 * A band of the page, such as a region's top rule: a hairline that bleeds
 * across the gutter at its start to meet the rail's border, its content
 * put back on the canvas's first column line by the same padding.
 */
const pageBand = (
  <div
    className={PAGE_BAND_CLASS_NAME}
    style={{
      marginInlineStart: "calc(-1 * var(--grid-gutter))",
      paddingInlineStart: "var(--grid-gutter)",
      borderBlockStartWidth: "1px",
      borderBlockStartStyle: "solid",
    }}
  >
    Region
  </div>
);

/** A document long enough to scroll, with an aside taller than the viewport. */
const documentLayout = (
  <DocumentLayout
    aside={
      <ul>
        {ASIDE_ENTRIES.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    }
    colophon={<p>Colophon</p>}
    rail={<nav aria-label="Rail">Rail</nav>}
    strip={<ModeStrip trail="Document" />}
  >
    <div>
      {pageBand}
      {PARAGRAPHS.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  </DocumentLayout>
);

/** A document with a strip and no colophon, as a site with no footer renders it. */
const bareDocumentLayout = (
  <DocumentLayout
    rail={<nav aria-label="Rail">Rail</nav>}
    strip={<ModeStrip trail="Document" />}
  >
    <p>Page</p>
  </DocumentLayout>
);

/** A document with a colophon and no strip, as a site's lobby renders it. */
const striplessDocumentLayout = (
  <DocumentLayout
    colophon={<p>Colophon</p>}
    rail={<nav aria-label="Rail">Rail</nav>}
  >
    <p>Page</p>
  </DocumentLayout>
);

/** The routes the trail's lens crumb links back to. */
const TRAIL_ROUTES: RouteMap = {
  standards: route({ url: "/standards", content: () => null }),
};

/**
 * A document whose strip carries the trail of an entity addressed by an
 * absolute IRI, which ends at its lens's crumb, a name wider than the
 * trail, under the router the trail links through.
 */
const trailDocumentLayout = (
  <RouterProvider
    router={createRouter(TRAIL_ROUTES, {
      adapter: createMemoryAdapter(
        `/standards/${encodeURIComponent(ABSOLUTE_IRI)}`,
      ),
    })}
  >
    <DocumentLayout
      rail={<nav aria-label="Rail">Rail</nav>}
      strip={
        <ModeStrip
          trail={
            <LensBreadcrumbs
              current={ABSOLUTE_IRI}
              lensLabel={LONG_LENS_LABEL}
              lensRouteName="standards"
            />
          }
        />
      }
    >
      <p>Page</p>
    </DocumentLayout>
  </RouterProvider>
);

/** Items enough to fill several rows of tiles at every width. */
const TILES = Array.from({ length: 12 }, (_, index) => `Tile ${index + 1}`);

/**
 * A document whose page lays a collection of tiles on a subgrid of its
 * columns, as a catalog does.
 */
const tiledDocumentLayout = (
  <DocumentLayout rail={<nav aria-label="Rail">Rail</nav>}>
    <ul
      style={{
        display: "grid",
        gridTemplateColumns: "subgrid",
        gridColumn: "1 / -1",
        gap: "var(--grid-gutter)",
        margin: 0,
        padding: 0,
      }}
    >
      {TILES.map((text) => (
        <li className={CANVAS_PAGE_TILE_CLASS_NAME} key={text}>
          {text}
        </li>
      ))}
    </ul>
  </DocumentLayout>
);

/** A workspace with an inspector and no strip. */
const striplessWorkspaceLayout = (
  <WorkspaceLayout
    inspector={<p>Inspector</p>}
    rail={<nav aria-label="Rail">Rail</nav>}
  >
    <p>Canvas</p>
  </WorkspaceLayout>
);

/**
 * Read the computed placement and display of the elements a reflow moves,
 * the layout's row gap and its rows.
 *
 * @note Impure: reads the page's computed styles and boxes.
 */
function readPlacement(page: Page) {
  return page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector(selector);
      if (element === null) return null;
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        display: style.display,
        position: style.position,
        column: [style.gridColumnStart, style.gridColumnEnd],
        row: style.gridRowStart,
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
      };
    };
    const layout = document.querySelector(
      ".ds.workspace-layout, .ds.document-layout",
    );
    return {
      rowGap: layout === null ? "" : getComputedStyle(layout).rowGap,
      rows:
        layout === null
          ? 0
          : getComputedStyle(layout).gridTemplateRows.split(" ").length,
      columns: getComputedStyle(
        document.querySelector(".ds.shell") ?? document.body,
      ).gridTemplateColumns.split(" ").length,
      columnStarts: (() => {
        const shell = getComputedStyle(
          document.querySelector(".ds.shell") ?? document.body,
        );
        const gap = Number.parseFloat(shell.columnGap);
        const widths = shell.gridTemplateColumns
          .split(" ")
          .map((width) => Number.parseFloat(width));
        return widths.map((_, index) =>
          widths
            .slice(0, index)
            .reduce((start, width) => start + width + gap, 0),
        );
      })(),
      rail: read(":is(.ds.workspace-layout, .ds.document-layout) > .rail"),
      canvas: read("main.ds.canvas"),
      page: read("main.ds.canvas > .page"),
      inspector: read(".ds.workspace-layout > .inspector"),
      trigger: read(".inspector-trigger"),
      aside: read("main.ds.canvas > .aside"),
      colophon: read(".ds.document-layout > .colophon"),
    };
  });
}

/**
 * Scroll the canvas from its top to its end, a fraction of its height at a
 * time, and return how many of the aside's entries were fully inside the
 * canvas at one position or another.
 *
 * @note Impure: scrolls the page's canvas and reads its boxes.
 */
function countReachableAsideEntries(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("main.ds.canvas");
    if (canvas === null) return 0;
    const entries = [...canvas.querySelectorAll(":scope > .aside li")];
    const reached = new Set<Element>();
    const step = canvas.clientHeight / 4;
    for (let top = 0; top <= canvas.scrollHeight; top += step) {
      canvas.scrollTop = top;
      const frame = canvas.getBoundingClientRect();
      for (const entry of entries) {
        const box = entry.getBoundingClientRect();
        if (box.top >= frame.top && box.bottom <= frame.bottom) {
          reached.add(entry);
        }
      }
    }
    canvas.scrollTop = 0;
    return reached.size;
  });
}

/**
 * Assert every band of a measured layout runs from the rail's border to
 * the viewport's edge and is painted over that whole width, its content
 * starting where the canvas's columns start and ending on the last column
 * line, the viewport's edge on a shell with no outer margin.
 */
function expectBands(
  measure: LayoutMeasure,
  width: number,
  count: number,
): void {
  expect(measure.bands).toHaveLength(count);
  for (const band of measure.bands) {
    expect(band.start, band.element).toBeCloseTo(measure.edges.railEnd, 1);
    expect(band.end, band.element).toBeCloseTo(width, 1);
    expect(band.paintedStart, band.element).toBeCloseTo(
      measure.edges.railEnd,
      1,
    );
    expect(band.paintedEnd, band.element).toBeCloseTo(width, 1);
    expect(band.contentStart, band.element).toBeCloseTo(
      measure.edges.canvasStart,
      1,
    );
    expect(band.contentEnd, band.element).toBeCloseTo(width, 1);
  }
}

let browser: Browser;
let css: string;

beforeAll(async () => {
  css = readStylesheets(COMPONENT_STYLESHEETS);
  browser = await launchBrowser();
});

afterAll(async () => {
  await browser?.close();
});

describe.each(ARCHETYPE_VIEWPORTS)("at $width px", (viewport) => {
  /** Open a server-rendered layout at this viewport. */
  const open = async (layout: ReactElement): Promise<Page> => {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    await page.setContent(renderPage(layout, css));
    return page;
  };

  it("lays the workspace's inspector as a region or behind the drawer's trigger, and the canvas between", async () => {
    const page = await open(workspaceLayout);
    try {
      const placement = await readPlacement(page);
      expect(placement.columns).toBe(viewport.columns);
      expect(placement.rowGap).toBe("16px");
      expect(placement.inspector?.display !== "none").toBe(
        viewport.inspectorShown,
      );
      expect(placement.trigger?.display !== "none").toBe(
        !viewport.inspectorShown,
      );
      expect(placement.canvas?.column).toEqual(viewport.canvasColumns);
      // On the shell's column lines: the canvas from the rail's edge to the
      // inspector, which takes the last three columns; without the region,
      // the canvas runs to the viewport's edge.
      const starts = placement.columnStarts;
      if (viewport.inspectorShown) {
        expect(placement.canvas?.left).toBeCloseTo(starts.at(2) ?? -1, 1);
        expect(placement.inspector?.left).toBeCloseTo(starts.at(-3) ?? -1, 1);
        expect(placement.inspector?.right).toBeCloseTo(viewport.width, 1);
        expect(placement.canvas?.right).toBeCloseTo(
          (starts.at(-3) ?? -1) - 16,
          1,
        );
      } else {
        expect(placement.canvas?.right).toBeCloseTo(viewport.width, 1);
      }
      const measure = await page.evaluate(measureLayout, MEASURE_OPTIONS);
      expect(measure.overflow).toEqual([]);
      expect(measure.scrollers).not.toContain("main.ds.canvas");
      expectBands(measure, viewport.width, 1);
    } finally {
      await page.close();
    }
  });

  it("keeps the document's aside in the canvas's one scroll, beside or under the page", async () => {
    const page = await open(documentLayout);
    try {
      const before = await readPlacement(page);
      expect(before.rowGap).toBe("16px");
      expect(before.canvas?.column).toEqual([
        viewport.width < 448 ? "2" : "3",
        "-1",
      ]);
      expect(before.aside?.position).toBe("static");
      if (viewport.asideBeside) {
        expect(before.aside?.column).toEqual(["-4", "-1"]);
        expect(before.page?.column).toEqual(["1", "-4"]);
        expect(before.aside?.top).toBe(before.canvas?.top);
        // On the shell's column lines: the page from the rail's edge to the
        // aside, which takes the last three columns to the viewport's edge.
        const starts = before.columnStarts;
        expect(before.page?.left).toBeCloseTo(starts.at(2) ?? -1, 1);
        expect(before.page?.right).toBeCloseTo((starts.at(-3) ?? -1) - 16, 1);
        expect(before.aside?.left).toBeCloseTo(starts.at(-3) ?? -1, 1);
        expect(before.aside?.right).toBeCloseTo(viewport.width, 1);
      } else {
        expect(before.aside?.row).toBe("2");
        expect(before.page?.column).toEqual(["1", "-1"]);
      }

      // Beside or under the page, the aside moves with the scroll.
      await page.evaluate((distance) => {
        document.querySelector("main.ds.canvas")?.scrollBy(0, distance);
      }, SCROLL_PX);
      const after = await readPlacement(page);
      expect(after.aside?.top).toBe((before.aside?.top ?? 0) - SCROLL_PX);

      // An aside taller than the viewport has no entry out of reach.
      expect(await countReachableAsideEntries(page)).toBe(ASIDE_ENTRIES.length);

      const measure = await page.evaluate(measureLayout, MEASURE_OPTIONS);
      expect(measure.overflow).toEqual([]);
      for (const scroller of measure.scrollers) {
        expect(["main.ds.canvas", "div.rail"]).toContain(scroller);
      }
      expectBands(measure, viewport.width, 2);

      // A band of the page bleeds inside the canvas's scroll, so it is
      // painted from the rail's border, its content on the canvas's first
      // column line.
      const pageMeasure = await page.evaluate(measureLayout, {
        ...MEASURE_OPTIONS,
        bandSelector: `.${PAGE_BAND_CLASS_NAME}`,
      });
      const [pageBandMeasure] = pageMeasure.bands;
      expect(pageMeasure.bands).toHaveLength(1);
      expect(pageBandMeasure?.paintedStart).toBeCloseTo(
        pageMeasure.edges.railEnd,
        1,
      );
      expect(pageBandMeasure?.contentStart).toBeCloseTo(
        pageMeasure.edges.canvasStart,
        1,
      );
      expect(pageMeasure.edges.canvasStart).toBeCloseTo(
        before.page?.left ?? -1,
        1,
      );

      // The colophon takes a row of its own, one gutter under the canvas.
      expect(before.rows).toBe(3);
      expect(before.canvas?.bottom).toBeLessThan(viewport.height);
    } finally {
      await page.close();
    }
  });

  it("ends a crumb wider than the strip in an ellipsis inside the strip", async () => {
    const page = await open(trailDocumentLayout);
    try {
      const measure = await page.evaluate(measureLayout, MEASURE_OPTIONS);
      expect(measure.overflow).toEqual([]);
      // One line, the trail ending at the lens's crumb, whose text is
      // painted no further than the trail's end, clipped by the crumb
      // itself, not by the strip.
      expect(measure.trails).toHaveLength(1);
      const [trail] = measure.trails;
      expect(trail?.rows).toBe(1);
      expect(trail?.textEnd).toBeGreaterThan(0);
      expect(trail?.textEnd).toBeLessThanOrEqual((trail?.end ?? 0) + 0.5);
      const crumb = await page.evaluate(() => {
        const text = document.querySelector(
          ".ds.lens-breadcrumbs .list > :last-child > .link",
        );
        const band = document.querySelector(".ds.mode-strip");
        if (text === null || band === null) return null;
        return {
          right: text.getBoundingClientRect().right,
          bandEnd: band.getBoundingClientRect().right,
          truncated: text.scrollWidth > text.clientWidth,
          textOverflow: getComputedStyle(text).textOverflow,
          crumbs: document.querySelectorAll(".ds.lens-breadcrumbs li").length,
          trailText:
            document.querySelector(".ds.lens-breadcrumbs")?.textContent ?? "",
        };
      });
      expect(crumb).not.toBeNull();
      expect(crumb?.right).toBeLessThanOrEqual((crumb?.bandEnd ?? 0) + 0.5);
      expect(crumb?.textOverflow).toBe("ellipsis");
      // The name is wider than the trail at every width (the strip's first
      // two columns, or its share of the one flex line below two groups):
      // it is cut at the crumb's end, and the address is not drawn.
      expect(crumb?.truncated).toBe(true);
      expect(crumb?.crumbs).toBe(1);
      expect(crumb?.trailText).not.toContain(ABSOLUTE_IRI);
    } finally {
      await page.close();
    }
  });

  it("ends the canvas of a document with no colophon flush with the viewport", async () => {
    const page = await open(bareDocumentLayout);
    try {
      const placement = await readPlacement(page);
      expect(placement.rows).toBe(2);
      expect(placement.canvas?.bottom).toBe(viewport.height);
    } finally {
      await page.close();
    }
  });

  it("starts the canvas of a document with no strip flush with the viewport's top", async () => {
    const page = await open(striplessDocumentLayout);
    try {
      const placement = await readPlacement(page);
      expect(placement.rows).toBe(2);
      expect(placement.canvas?.top).toBe(0);
      expect(placement.colophon?.bottom).toBe(viewport.height);
      expect(placement.colophon?.top).toBe(
        (placement.canvas?.bottom ?? 0) + 16,
      );
    } finally {
      await page.close();
    }
  });

  it("spans each page tile over two columns, or the whole row below one group", async () => {
    const page = await open(tiledDocumentLayout);
    try {
      const { canvas, tiles } = await page.evaluate((selector) => {
        const box = (element: Element | null) => {
          const rect = element?.getBoundingClientRect();
          return { left: rect?.left ?? -1, right: rect?.right ?? -1 };
        };
        // The canvas's columns are its content box: its padding puts them
        // back on their lines after its box bleeds across the gutter.
        const columns = (element: Element | null) => {
          const { left, right } = box(element);
          const style = element === null ? null : getComputedStyle(element);
          return {
            left: left + Number.parseFloat(style?.paddingLeft ?? "0"),
            right: right - Number.parseFloat(style?.paddingRight ?? "0"),
          };
        };
        return {
          canvas: columns(document.querySelector("main.ds.canvas")),
          tiles: [...document.querySelectorAll(selector)].map((tile) => ({
            ...box(tile),
            column: `${getComputedStyle(tile).gridColumnStart} / ${getComputedStyle(tile).gridColumnEnd}`,
          })),
        };
      }, `.${CANVAS_PAGE_TILE_CLASS_NAME}`);
      expect(tiles).toHaveLength(TILES.length);
      for (const tile of tiles) {
        expect(tile.column).toBe(
          viewport.width < 448 ? "1 / -1" : "span 2 / auto",
        );
      }
      expect(Math.min(...tiles.map(({ left }) => left))).toBe(canvas.left);
      expect(
        canvas.right - Math.max(...tiles.map(({ right }) => right)),
      ).toBeLessThanOrEqual(0.5);
    } finally {
      await page.close();
    }
  });

  it("starts the canvas of a workspace with no strip flush with the viewport's top", async () => {
    const page = await open(striplessWorkspaceLayout);
    try {
      const placement = await readPlacement(page);
      expect(placement.rows).toBe(1);
      expect(placement.canvas?.top).toBe(0);
      expect(placement.canvas?.bottom).toBe(viewport.height);
      if (viewport.inspectorShown) {
        expect(placement.inspector?.top).toBe(0);
      }
    } finally {
      await page.close();
    }
  });
});
