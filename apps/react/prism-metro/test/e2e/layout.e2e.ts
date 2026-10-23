// @vitest-environment node

/**
 * The page grid and the scroll model, measured in a real browser: the metro
 * graph in its own process and the dev cell pointed at it serve a workspace
 * page and three document pages, a station's page, the landing and the
 * not-found page, and Chromium lays each out once at a desktop and a phone
 * width, measuring it in the light and the dark theme. What is
 * asserted is what the layout promises: one intrinsic grid, the shell, which
 * is the one query container; no page scroll, and nothing reaching past the
 * viewport or past its region, at 390px too; twelve columns at 1440px and
 * four at 390px; a workspace canvas that never scrolls; a document whose
 * only scrolling regions are its canvas and its rail; a canvas that starts
 * one gutter under the strip, or at the viewport's top with no strip, as on
 * the landing and the not-found page, its page then starting one gutter
 * down; a strip whose band runs from the rail's
 * border to the viewport's edge with its content from the canvas's first
 * column line to its last; and every gap, padding and margin of the chrome
 * a multiple of 4px.
 */
import {
  launchBrowser,
  measurePage,
  type ThemedMeasure,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NORTHGATE_CURIE } from "../../testing/fixtures.js";
import {
  DEV_READY_MS,
  GRAPH_READY_MS,
  PAGE_SETTLE_MS,
  WORKSPACE_PATH,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/**
 * Pages on the document archetype: a station's page, under its lens's
 * strip, and the landing and the not-found page, which have no strip.
 */
const DOCUMENT_PATHS = [
  `/stations/${encodeURIComponent(NORTHGATE_CURIE)}`,
  "/",
  "/not-found",
] as const;

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;

beforeAll(
  async () => {
    graph = await startServer("graph", CWD, {
      timeoutMs: GRAPH_READY_MS,
      portEnv: "GRAPH_PORT",
      hostname: "127.0.0.1",
    });
    server = await startServer("dev:bun", CWD, {
      timeoutMs: DEV_READY_MS,
      env: { VITE_GRAPHQL_URL: `${graph.base}/graphql` },
    });
    browser = await launchBrowser();
  },
  GRAPH_READY_MS + DEV_READY_MS + PAGE_SETTLE_MS,
);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
  await graph?.stop();
});

describe.each(VIEWPORTS)("at $name px", (viewport) => {
  /**
   * Open `path` once at this viewport and measure it in every theme.
   *
   * @note Impure: opens a browser tab, which it closes.
   */
  const measure = (path: string): Promise<readonly ThemedMeasure[]> =>
    measurePage(browser, {
      url: new URL(path, server.base).href,
      viewport,
      origins: [new URL(server.base).origin, new URL(graph.base).origin],
      timeoutMs: PAGE_SETTLE_MS,
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
      }
    },
  );
});
