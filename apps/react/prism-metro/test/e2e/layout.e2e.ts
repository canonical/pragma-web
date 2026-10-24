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
 * a multiple of 4px. The station index is measured in both its views (the
 * cards view as a known overflow), and a station page once more with a
 * field name longer than its key's track, which must clip there rather
 * than run under the value or widen the canvas, and once for its fields'
 * keys, a key carrying the inherited tag on the same line height as a
 * plain one.
 */
import {
  launchBrowser,
  measurePage,
  type ThemedMeasure,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NORTHGATE_CURIE } from "../../testing/fixtures.js";
import {
  DEV_READY_MS,
  GRAPH_READY_MS,
  LONG_FIELD_NAME,
  PAGE_SETTLE_MS,
  WORKSPACE_PATH,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** A station's page, whose fields are key values. */
const STATION_PATH = `/stations/${encodeURIComponent(NORTHGATE_CURIE)}`;

/**
 * Pages on the document archetype: the station index in its rows view and
 * a station's page, under their lens's strip, and the landing and the
 * not-found page, which have no strip.
 */
const DOCUMENT_PATHS = ["/stations", STATION_PATH, "/", "/not-found"] as const;

/**
 * The station index in its cards view, which runs past the canvas: the
 * `Node` card arm renders its own one-column card, which ignores the
 * `Cards` group's two-column span. It is measured as an expected failure:
 * the test turns red once the arm renders the projections' `EntityCard`,
 * and the path then moves to `DOCUMENT_PATHS`.
 */
const OVERFLOWING_DOCUMENT_PATHS = ["/stations?view=cards"] as const;

/**
 * Set `name` as the text of the page's first key and measure the pair: the
 * key's overflow, its end and the value's start and top, the key's bottom,
 * and the canvas's scroll and client widths. It runs in the page.
 *
 * @param name - The field name to set.
 * @returns The measurements.
 * @note Impure: rewrites the page's first key.
 */
function placeLongKey(name: string): {
  readonly overflowX: string;
  readonly keyEnd: number;
  readonly keyBottom: number;
  readonly valueStart: number;
  readonly valueTop: number;
  readonly canvasScrollWidth: number;
  readonly canvasClientWidth: number;
} {
  const pair = document.querySelector(".ds.key-value-list > .pair");
  const key = pair?.querySelector(".key");
  const code = key?.querySelector("code");
  const value = pair?.querySelector(".value");
  const canvas = document.querySelector("main.ds.canvas");
  if (!key || !code || !value || !canvas) {
    throw new Error("the page has no key value to measure");
  }
  code.textContent = name;
  const keyBox = key.getBoundingClientRect();
  const valueBox = value.getBoundingClientRect();
  return {
    overflowX: getComputedStyle(key).overflowX,
    keyEnd: keyBox.right,
    keyBottom: keyBox.bottom,
    valueStart: valueBox.left,
    valueTop: valueBox.top,
    canvasScrollWidth: canvas.scrollWidth,
    canvasClientWidth: canvas.clientWidth,
  };
}

/**
 * Measure the height of every key of the page's fields, split by whether
 * the key carries the inherited tag. It runs in the page.
 *
 * @returns The heights of the tagged keys and of the plain ones.
 */
function measureFieldKeys(): {
  readonly tagged: readonly number[];
  readonly plain: readonly number[];
} {
  const keys = [...document.querySelectorAll(".ds.field-list .key")];
  const heightOf = (key: Element): number => key.getBoundingClientRect().height;
  return {
    tagged: keys.filter((key) => key.querySelector(".inherited")).map(heightOf),
    plain: keys.filter((key) => !key.querySelector(".inherited")).map(heightOf),
  };
}

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

  /**
   * Open `path` at this viewport, serving only the app's and the graph's
   * origins and leaving the live-reload socket unconnected.
   *
   * @note Impure: opens a browser tab, which the caller closes.
   */
  const open = async (path: string): Promise<Page> => {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const origins = [new URL(server.base).origin, new URL(graph.base).origin];
    await page.route("**/*", (route) =>
      origins.includes(new URL(route.request().url()).origin)
        ? route.continue()
        : route.fulfill({ status: 204, body: "" }),
    );
    await page.routeWebSocket(
      () => true,
      () => {
        // Left unconnected, the dev server's live-reload socket stays silent.
      },
    );
    await page.goto(new URL(path, server.base).href, {
      waitUntil: "networkidle",
      timeout: PAGE_SETTLE_MS,
    });
    return page;
  };

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
      }
    },
  );

  it.fails.each(OVERFLOWING_DOCUMENT_PATHS)(
    "runs the document at %s past its canvas until its cards span two columns",
    async (path) => {
      expectGrid(await measure(path));
    },
  );

  it("clips a key longer than its track there, the canvas not scrolling sideways", async () => {
    const page = await open(STATION_PATH);
    try {
      const pair = await page.evaluate(placeLongKey, LONG_FIELD_NAME);
      expect(pair.overflowX).toBe("clip");
      expect(pair.canvasScrollWidth).toBeLessThanOrEqual(
        pair.canvasClientWidth,
      );
      // Side by side, the key ends before its value starts; stacked below
      // two groups, the value starts under the key.
      if (pair.valueTop < pair.keyBottom) {
        expect(pair.keyEnd).toBeLessThanOrEqual(pair.valueStart);
      }
    } finally {
      await page.close();
    }
  });

  it("keeps a key carrying the inherited tag on a plain key's line", async () => {
    const page = await open(STATION_PATH);
    try {
      const { tagged, plain } = await page.evaluate(measureFieldKeys);
      expect(tagged.length).toBeGreaterThan(0);
      expect(plain.length).toBeGreaterThan(0);
      expect(new Set([...plain, ...tagged])).toEqual(new Set(plain));
      expect(new Set(plain).size).toBe(1);
    } finally {
      await page.close();
    }
  });
});
