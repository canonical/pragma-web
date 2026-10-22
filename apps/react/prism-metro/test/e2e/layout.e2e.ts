// @vitest-environment node

/**
 * The page grid and the scroll model, measured in a real browser: the metro
 * graph in its own process and the dev cell pointed at it serve a workspace
 * page and a document page, and Chromium lays each out at a desktop and a phone width, in the
 * light and the dark theme. What is asserted is what the layout promises:
 * one intrinsic grid, the shell, which is the one query container; no page
 * scroll and no horizontal overflow, at 390px too; twelve columns at 1440px
 * and four at 390px; a workspace canvas that never scrolls; a document
 * whose only scrolling regions are its canvas, its rail and its aside; and
 * every gap, padding and margin of the chrome a multiple of 4px.
 */
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NORTHGATE_CURIE } from "../../testing/fixtures.js";
import {
  CHROME_SELECTOR,
  DEV_READY_MS,
  GRAPH_READY_MS,
  PAGE_SETTLE_MS,
  SPACING_STEP_PX,
  THEMES,
  VIEWPORTS,
  WORKSPACE_PATH,
} from "./constants.js";
import launchBrowser from "./launchBrowser.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** A page on the document archetype: a station's entity page. */
const DOCUMENT_PATH = `/stations/${encodeURIComponent(NORTHGATE_CURIE)}`;

/** What one page's layout measures to. */
interface LayoutMeasure {
  /** Every `.grid.intrinsic`: its classes, container name and columns. */
  readonly grids: readonly {
    readonly className: string;
    readonly containerName: string;
    readonly columns: number;
  }[];
  /** The document's scroll box and the viewport. */
  readonly page: {
    readonly scrollHeight: number;
    readonly scrollWidth: number;
    readonly innerHeight: number;
    readonly innerWidth: number;
  };
  /** The elements that scroll: a scrolling overflow and content past it. */
  readonly scrollers: readonly string[];
  /** The canvas's overflow and its scroll box. */
  readonly canvas: {
    readonly overflow: string;
    readonly scrollHeight: number;
    readonly clientHeight: number;
  };
  /** The block overflow of the layout's rail, inspector and aside regions. */
  readonly regionOverflow: Readonly<Record<string, string | null>>;
  /** Whether the inspector's drawer trigger shows. */
  readonly triggerShown: boolean;
  /** The chrome's spacings, as `px value → count`. */
  readonly histogram: Readonly<Record<string, number>>;
  /** The chrome's spacings off the 4px grid, as `element property: value`. */
  readonly offGrid: readonly string[];
}

/**
 * Measure the layout of the page in the tab: run in the browser, so it
 * reads computed styles and boxes only. The chrome's spacing excludes what
 * resolves to a measure rather than a choice: an auto margin, which takes
 * the free space, and the typography engine's baseline nudges on text
 * blocks.
 *
 * @note Impure: reads the page's document and its computed styles.
 */
function measureLayout({
  chromeSelector,
  step,
}: {
  readonly chromeSelector: string;
  readonly step: number;
}): LayoutMeasure {
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
      aside: readOverflow(".ds.document-layout > .aside"),
    },
    triggerShown:
      trigger !== null && getComputedStyle(trigger).display !== "none",
    histogram,
    offGrid,
  };
}

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;

/**
 * Open `path` at a viewport, in a theme, and measure it once it has settled.
 * Only the cell's and the graph's origins are served; anything else is
 * answered empty, so a third-party asset the sandbox cannot reach never
 * holds the page open.
 *
 * @note Impure: opens a browser tab, which it closes.
 */
const measurePage = async (
  path: string,
  viewport: { readonly width: number; readonly height: number },
  theme: (typeof THEMES)[number],
): Promise<LayoutMeasure> => {
  const page: Page = await browser.newPage({ viewport });
  try {
    const origins = new Set([
      new URL(server.base).origin,
      new URL(graph.base).origin,
    ]);
    await page.route("**/*", (route) =>
      origins.has(new URL(route.request().url()).origin)
        ? route.continue()
        : route.fulfill({ status: 204, body: "" }),
    );
    await page.routeWebSocket(
      () => true,
      () => {
        // Left unconnected, the dev cell's live-reload socket stays silent.
      },
    );
    await page.goto(new URL(path, server.base).href, {
      waitUntil: "networkidle",
      timeout: PAGE_SETTLE_MS,
    });
    await page.evaluate((name) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(name);
    }, theme);
    return await page.evaluate(measureLayout, {
      chromeSelector: CHROME_SELECTOR,
      step: SPACING_STEP_PX,
    });
  } finally {
    await page.close();
  }
};

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
  describe.each(THEMES)("in the %s theme", (theme) => {
    it.each([WORKSPACE_PATH, DOCUMENT_PATH])(
      "lays %s on the one intrinsic grid, with no page scroll and nothing off the 4px grid",
      async (path) => {
        const measure = await measurePage(path, viewport, theme);
        expect(measure.grids).toEqual([
          {
            className: "ds shell grid intrinsic",
            containerName: "shell",
            columns: viewport.columns,
          },
        ]);
        expect(measure.page.scrollHeight).toBeLessThanOrEqual(
          measure.page.innerHeight,
        );
        expect(measure.page.scrollWidth).toBeLessThanOrEqual(
          measure.page.innerWidth,
        );
        expect(measure.regionOverflow.rail).toBe("auto");
        expect(
          measure.offGrid,
          `spacing histogram: ${JSON.stringify(measure.histogram)}`,
        ).toEqual([]);
      },
    );

    it("keeps the workspace's canvas still: it never scrolls", async () => {
      const measure = await measurePage(WORKSPACE_PATH, viewport, theme);
      expect(measure.canvas.overflow).toBe("hidden");
      expect(measure.canvas.scrollHeight).toBe(measure.canvas.clientHeight);
      expect(measure.scrollers).not.toContain("main.ds.canvas");
      // The Definitions lens gives its workspace no inspector: no region
      // and no drawer trigger.
      expect(measure.regionOverflow.inspector).toBeNull();
      expect(measure.triggerShown).toBe(false);
    });

    it("scrolls a document only in its canvas, its rail and its aside", async () => {
      const measure = await measurePage(DOCUMENT_PATH, viewport, theme);
      expect(measure.canvas.overflow).toBe("auto");
      for (const scroller of measure.scrollers) {
        expect(["main.ds.canvas", "div.rail", "div.aside"]).toContain(scroller);
      }
    });
  });
});
