// @vitest-environment node

/**
 * The page grid and the scroll model, measured in a real browser: the dev
 * cell (its graph server alongside) serves a workspace page and several
 * document pages, and Chromium lays each out once at a desktop and a phone
 * width, measuring it in the light and the dark theme. What is asserted is
 * what the layout promises: one intrinsic grid, the shell, which is the one
 * query container; no page scroll, and nothing reaching past the viewport
 * or past its region, and nothing in the strip scrolling sideways, at
 * 390px too; twelve columns at 1440px and four at 390px; a workspace canvas
 * that never scrolls; a document whose only scrolling regions are its
 * canvas and its rail, and whose page's first element spans the whole main
 * column; a catalog whose cards fill their rows; a canvas that starts one
 * gutter under the strip, or at the viewport's top with no strip, its
 * page then starting one gutter down; bands,
 * the strip's and the colophon's, that run from the rail's border to the
 * viewport's edge with their content from the canvas's first column line
 * to its last;
 * every gap, padding and margin of the chrome a multiple of 4px; and the
 * workspace drawn in the face it ships, the dev cell delivering its font.
 * The standards index's entries keep every title whole, at 390px too, an
 * entry whose title and address do not share a line moving its address
 * to a line of its own.
 */
import {
  launchBrowser,
  measurePage,
  type ThemedMeasure,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CATALOG_CARD_SELECTOR,
  CATALOG_PATH,
  DEV_READY_MS,
  DOCUMENT_PATHS,
  PAGE_SETTLE_MS,
  STANDARDS_INDEX_PATH,
  STANDARDS_INDEX_ROW_SELECTOR,
  WIDTH_TOLERANCE_PX,
  WORKSPACE_PATH,
} from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/**
 * Count the standards index's entries, those whose title is cut, and those
 * whose address is cut on the title's line. It runs in the page.
 *
 * @returns The counts.
 * @throws When an entry has no title or no address.
 */
function countCutEntries(): {
  readonly entries: number;
  readonly cutTitles: number;
  readonly cutBesideTitle: number;
} {
  const rows = [
    ...document.querySelectorAll(".ds.standards-index .ds.entity-row"),
  ];
  const measured = rows.map((row) => {
    const identity = row.querySelector(".identity");
    const meta = row.querySelector(".meta");
    if (!identity || !meta) {
      throw new Error("an entry has no title or no address");
    }
    return {
      titleCut: identity.scrollWidth > identity.clientWidth,
      addressCut: meta.scrollWidth > meta.clientWidth,
      addressBeside:
        meta.getBoundingClientRect().top ===
        identity.getBoundingClientRect().top,
    };
  });
  return {
    entries: measured.length,
    cutTitles: measured.filter(({ titleCut }) => titleCut).length,
    cutBesideTitle: measured.filter(
      ({ addressCut, addressBeside }) => addressCut && addressBeside,
    ).length,
  };
}

let server: RunningServer;
let browser: Browser;

beforeAll(async () => {
  server = await startServer("dev:bun", CWD, { timeoutMs: DEV_READY_MS });
  browser = await launchBrowser();
}, DEV_READY_MS + PAGE_SETTLE_MS);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
});

describe.each(VIEWPORTS)("at $name px", (viewport) => {
  /**
   * Open `path` once at this viewport and measure it in every theme, with
   * the elements that must fill the page's rows, if any.
   *
   * @note Impure: opens a browser tab, which it closes.
   */
  const measure = (
    path: string,
    fillSelector?: string,
  ): Promise<readonly ThemedMeasure[]> =>
    measurePage(browser, {
      url: new URL(path, server.base).href,
      viewport,
      origins: [new URL(server.base).origin, new URL(server.graphBase).origin],
      timeoutMs: PAGE_SETTLE_MS,
      fillSelector,
    });

  /** Assert what every page promises, in each theme it was measured in. */
  const expectGrid = (measures: readonly ThemedMeasure[]): void => {
    for (const { theme, measure: layout } of measures) {
      expect(layout.grids, theme).toEqual([
        {
          className: "ds shell grid intrinsic",
          containerName: "shell",
          columns: viewport.columns,
        },
      ]);
      expect(layout.page.scrollHeight, theme).toBeLessThanOrEqual(
        layout.page.innerHeight,
      );
      expect(layout.overflow, theme).toEqual([]);
      expect(layout.regionOverflow.rail, theme).toBe("auto");
      const { edges } = layout;
      // The canvas starts one gutter under the row above it: the drawer
      // trigger's own row while it shows, else the strip's; so the trigger
      // covers nothing the canvas holds.
      const above = edges.triggerBottom ?? edges.stripBottom;
      expect(edges.canvasTop, theme).toBeCloseTo(
        above === null ? 0 : above + edges.rowGap,
        1,
      );
      // With no row above, the page itself starts one gutter under the
      // viewport's top, as a page under a strip starts under its rule.
      if (above === null) {
        expect(layout.canvasPage.firstChildTop, theme).toBeCloseTo(
          edges.rowGap,
          1,
        );
      }
      for (const band of layout.bands) {
        expect(band.start, `${theme} ${band.element}`).toBeCloseTo(
          edges.railEnd,
          1,
        );
        expect(band.end, `${theme} ${band.element}`).toBeCloseTo(
          layout.page.innerWidth,
          1,
        );
        expect(band.contentStart, `${theme} ${band.element}`).toBeCloseTo(
          edges.canvasStart,
          1,
        );
        expect(band.contentEnd, `${theme} ${band.element}`).toBeCloseTo(
          layout.page.innerWidth,
          1,
        );
      }
      expect(
        layout.offGrid,
        `${theme} spacing histogram: ${JSON.stringify(layout.histogram)}`,
      ).toEqual([]);
    }
  };

  it("draws the workspace in the face it ships, Ubuntu Sans, delivered whole", async () => {
    const page = await browser.newPage({ viewport });
    try {
      const origins = [
        new URL(server.base).origin,
        new URL(server.graphBase).origin,
      ];
      await page.route("**/*", (route) =>
        origins.includes(new URL(route.request().url()).origin)
          ? route.continue()
          : route.fulfill({ status: 204, body: "" }),
      );
      await page.goto(new URL(WORKSPACE_PATH, server.base).href, {
        waitUntil: "load",
        timeout: PAGE_SETTLE_MS,
      });
      // The graph's widths are measured from this face: a page that falls
      // back to another draws its labels past their boxes.
      const face = await page.evaluate(async () => {
        const font = '600 14px "Ubuntu Sans"';
        const faces = await document.fonts.load(font).catch(() => []);
        return {
          loaded: faces.filter((each) => each.status === "loaded").length,
          checked: document.fonts.check(font),
        };
      });
      expect(face.loaded).toBeGreaterThan(0);
      expect(face.checked).toBe(true);
    } finally {
      await page.close();
    }
  });

  it("lays the workspace on the one grid with a canvas that never scrolls", async () => {
    const measures = await measure(WORKSPACE_PATH);
    expectGrid(measures);
    for (const { theme, measure: layout } of measures) {
      expect(layout.canvas.overflow, theme).toBe("hidden");
      expect(layout.canvas.scrollHeight, theme).toBe(
        layout.canvas.clientHeight,
      );
      expect(layout.scrollers, theme).not.toContain("main.ds.canvas");
      // The Definitions lens gives its workspace an inspector: a region
      // that scrolls on its own from three groups of columns, a drawer
      // behind its trigger below them.
      expect(layout.regionOverflow.inspector, theme).toBe("auto");
      expect(layout.triggerShown, theme).toBe(viewport.width < 1376);
      // The page never scrolls, a phone's included: below one group of
      // columns the class graph's rows scroll inside the explorer's well,
      // under the strip and the rail's search, as every region of the
      // workspace scrolls on its own; above it the well pans instead.
      expect(
        layout.scrollers.includes("div.ds.hierarchy-well.explorer-well"),
        theme,
      ).toBe(viewport.width < 448);
    }
  });

  it.each(DOCUMENT_PATHS)(
    "lays the document at %s on the one grid, scrolling only its canvas and its rail",
    async (path) => {
      const measures = await measure(path);
      expectGrid(measures);
      for (const { theme, measure: layout } of measures) {
        expect(layout.canvas.overflow, theme).toBe("auto");
        for (const scroller of layout.scrollers) {
          expect(["main.ds.canvas", "div.rail"], theme).toContain(scroller);
        }
        // The page's first element spans the whole main column, never
        // one track of it.
        expect(layout.canvasPage.width, theme).toBeGreaterThan(0);
        expect(
          Math.abs(layout.canvasPage.firstChildWidth - layout.canvasPage.width),
          theme,
        ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      }
    },
  );

  // Past one group the canvas holds an even number of columns, which the
  // catalog's two-column cards fill; at four columns the canvas holds
  // three, and each card takes the whole row. Either way the cards reach
  // the canvas's end.
  it("fills the catalog's rows with cards to the canvas's end", async () => {
    const measures = await measure(CATALOG_PATH, CATALOG_CARD_SELECTOR);
    for (const { theme, measure: layout } of measures) {
      const shortfall = layout.canvasPage.fillShortfall;
      expect(shortfall, theme).not.toBeNull();
      expect(shortfall?.start, theme).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      expect(shortfall?.end, theme).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
    }
  });

  it("spans the standards index's links and lists over the main column", async () => {
    const measures = await measure(
      STANDARDS_INDEX_PATH,
      STANDARDS_INDEX_ROW_SELECTOR,
    );
    for (const { theme, measure: layout } of measures) {
      const shortfall = layout.canvasPage.fillShortfall;
      expect(shortfall, theme).not.toBeNull();
      expect(shortfall?.start, theme).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      expect(shortfall?.end, theme).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
    }
  });

  it("keeps every standards index title whole, its address on its own line where they do not fit", async () => {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    try {
      const origins = [
        new URL(server.base).origin,
        new URL(server.graphBase).origin,
      ];
      await page.route("**/*", (route) =>
        origins.includes(new URL(route.request().url()).origin)
          ? route.continue()
          : route.fulfill({ status: 204, body: "" }),
      );
      await page.goto(new URL(STANDARDS_INDEX_PATH, server.base).href, {
        waitUntil: "networkidle",
        timeout: PAGE_SETTLE_MS,
      });
      const counts = await page.evaluate(countCutEntries);
      expect(counts.entries).toBeGreaterThan(0);
      expect(counts.cutTitles).toBe(0);
      // An address is cut only on a line of its own, longer than the row.
      expect(counts.cutBesideTitle).toBe(0);
    } finally {
      await page.close();
    }
  });
});
