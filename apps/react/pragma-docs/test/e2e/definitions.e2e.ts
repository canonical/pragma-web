// @vitest-environment node

/**
 * The Definitions explorer in a real browser, served by the built preview
 * cell as a reader gets it, at a desktop and a phone width and at two
 * shorter desktops: it hydrates with no console error; it opens at a zoom
 * where every text of the graph renders at 12px or more on screen, the
 * phone view included, on a window whose left, top and right edges cut
 * through no class; every class's label fits its box in the font the page
 * ships; the term rail's ontology headings are laid out; and, on a phone,
 * the inspector's drawer trigger covers nothing of the explorer, its search
 * field least of all. A filter chip's refit and a namespace's keep every
 * class in view labelled and cut none; Fit brings every class into view,
 * unlabelled where the whole fits only below the overview zoom; and the
 * inspector's field rows put their ranges on one column line.
 */
import {
  launchBrowser,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CAMERA_SETTLE_MS,
  DEFINITIONS_PATHS,
  GRAPH_NODE_TEXT_INSET,
  MIN_SCREEN_TEXT_PX,
  PAGE_SETTLE_MS,
  PREVIEW_READY_MS,
  SHORT_DESKTOP_VIEWPORTS,
  WIDTH_TOLERANCE_PX,
} from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

let server: RunningServer;
let browser: Browser;

beforeAll(async () => {
  server = await startServer("preview:bun", CWD, {
    timeoutMs: PREVIEW_READY_MS,
  });
  browser = await launchBrowser();
}, PREVIEW_READY_MS + PAGE_SETTLE_MS);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
});

/** What the page holds once it has hydrated and its fonts have loaded. */
interface ExplorerMeasure {
  /** The smallest on-screen size of any visible text of a graph, in px. */
  readonly minTextPx: number;
  /** How many visible texts the graphs draw. */
  readonly textCount: number;
  /**
   * The canvas's classes in view that draw no label: none once the canvas
   * opens at a zoom where every label is legible.
   */
  readonly unlabelled: number;
  /** Whether the page's font face for 14px text has loaded. */
  readonly fontLoaded: boolean;
  /** The labels whose title, and count, run past their box's insets. */
  readonly overflowing: readonly string[];
  /** The height of each ontology heading the term rail displays, in px. */
  readonly railHeadingHeights: readonly number[];
  /** Whether the drawer trigger and the rail's search field intersect. */
  readonly triggerCoversSearch: boolean;
  /**
   * The canvas's classes the viewport's left, top or right edge cuts, the
   * bottom-right corner included: none, a class the bottom edge crosses
   * within the viewport's width showing that more lies below.
   */
  readonly cut: readonly string[];
  /** How many of the canvas's classes lie wholly in its viewport. */
  readonly inView: number;
  /** How many classes the canvas draws and does not hide. */
  readonly drawn: number;
  /** The left edge of each field row's range in the inspector, in px. */
  readonly rangeLefts: readonly number[];
}

/**
 * Measure the explorer in the page, as the graph heuristics' reviewer
 * does: every visible SVG text's computed size times its screen scale,
 * every graph node's label against its box, the rail's headings and the
 * trigger against the search field, the classes the viewport's edges cut,
 * to within the tolerance of sub-pixel rounding, and the inspector's field
 * ranges.
 */
function measureExplorer({
  inset,
  tolerance,
}: {
  readonly inset: number;
  readonly tolerance: number;
}): ExplorerMeasure {
  const isShown = (element: Element): boolean => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  };
  const texts = [...document.querySelectorAll("svg text")].filter(
    (text) => isShown(text) && (text.textContent ?? "").trim() !== "",
  ) as SVGTextElement[];
  const sizes = texts.map(
    (text) =>
      Number.parseFloat(getComputedStyle(text).fontSize) *
      (text.getScreenCTM()?.a ?? 1),
  );
  const overflowing = [...document.querySelectorAll(".ds.entity-graph-node")]
    .filter(isShown)
    .flatMap((node) => {
      const surface = node.querySelector(".surface");
      const title = node.querySelector<SVGTextElement>(".title");
      const count = node.querySelector<SVGTextElement>(".count");
      if (surface === null || title === null) return [];
      const room = Number(surface.getAttribute("width")) - 2 * inset;
      const used =
        title.getComputedTextLength() + (count?.getComputedTextLength() ?? 0);
      return used > room ? [title.textContent ?? ""] : [];
    });
  const viewport = document
    .querySelector(".ds.graph-canvas .viewport")
    ?.getBoundingClientRect();
  const unlabelled = [
    ...document.querySelectorAll(".ds.graph-canvas .ds.entity-graph-node"),
  ].filter((node) => {
    const box = node.getBoundingClientRect();
    const inView =
      viewport !== undefined &&
      box.width > 0 &&
      box.left >= viewport.left &&
      box.right <= viewport.right &&
      box.top >= viewport.top &&
      box.bottom <= viewport.bottom;
    return inView && node.querySelector(".title") === null;
  }).length;
  const canvasNodes = [
    ...document.querySelectorAll(".ds.graph-canvas .node:not(.is-hidden)"),
  ].map((node) => ({
    label: node.getAttribute("data-id") ?? "",
    box: (node.querySelector(".surface") ?? node).getBoundingClientRect(),
  }));
  const shown = canvasNodes.filter(({ box }) => box.width > 0);
  const cut =
    viewport === undefined
      ? []
      : shown
          .filter(
            ({ box }) =>
              box.left < viewport.right - tolerance &&
              box.right > viewport.left + tolerance &&
              box.top < viewport.bottom - tolerance &&
              box.bottom > viewport.top + tolerance &&
              (box.left < viewport.left - tolerance ||
                box.top < viewport.top - tolerance ||
                box.right > viewport.right + tolerance),
          )
          .map(({ label }) => label);
  const inView =
    viewport === undefined
      ? 0
      : shown.filter(
          ({ box }) =>
            box.left >= viewport.left &&
            box.right <= viewport.right &&
            box.top >= viewport.top &&
            box.bottom <= viewport.bottom,
        ).length;
  const rangeLefts = [
    ...document.querySelectorAll(".inspector .ds.field-list .range"),
  ].map((range) => range.getBoundingClientRect().left);
  const trigger = document.querySelector(".inspector-trigger");
  const search = document.querySelector(".ds.term-rail input");
  const a = trigger?.getBoundingClientRect();
  const b = search?.getBoundingClientRect();
  const triggerCoversSearch =
    a !== undefined &&
    b !== undefined &&
    isShown(trigger as Element) &&
    a.left < b.right &&
    b.left < a.right &&
    a.top < b.bottom &&
    b.top < a.bottom;
  return {
    minTextPx: Math.min(...sizes),
    textCount: sizes.length,
    unlabelled,
    fontLoaded: document.fonts.check('14px "Ubuntu Sans"'),
    overflowing,
    // A phone hides the rail's lists, headings and all; a heading it shows
    // has a box, however thin.
    railHeadingHeights: [...document.querySelectorAll(".ds.term-rail .heading")]
      .filter((heading) => heading.getClientRects().length > 0)
      .map((heading) => heading.getBoundingClientRect().height),
    triggerCoversSearch,
    cut,
    inView,
    drawn: shown.length,
    rangeLefts,
  };
}

/**
 * Open `path` at a viewport, collecting every console error and uncaught
 * exception, and measure the explorer once its fonts have loaded.
 *
 * @note Impure: opens a browser tab, which it closes.
 */
const openExplorer = async (
  path: string,
  viewport: { readonly width: number; readonly height: number },
  act?: (page: Page) => Promise<void>,
): Promise<{ errors: string[]; measure: ExplorerMeasure }> => {
  const page: Page = await browser.newPage({ viewport });
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`${message.text()} (${message.location().url})`);
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
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
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    if (act !== undefined) {
      await act(page);
      await page.waitForTimeout(CAMERA_SETTLE_MS);
    }
    return {
      errors,
      measure: await page.evaluate(measureExplorer, {
        inset: GRAPH_NODE_TEXT_INSET,
        tolerance: WIDTH_TOLERANCE_PX,
      }),
    };
  } finally {
    await page.close();
  }
};

describe.each([...VIEWPORTS, ...SHORT_DESKTOP_VIEWPORTS])(
  "at $name px",
  (viewport) => {
    it.each(DEFINITIONS_PATHS)(
      "hydrates %s silently, with every graph text legible, every label in its box and no class cut",
      async (path) => {
        const { errors, measure } = await openExplorer(path, viewport);
        expect(errors).toEqual([]);
        expect(measure.fontLoaded).toBe(true);
        expect(measure.textCount).toBeGreaterThan(0);
        expect(measure.unlabelled).toBe(0);
        expect(measure.minTextPx).toBeGreaterThanOrEqual(MIN_SCREEN_TEXT_PX);
        expect(measure.overflowing).toEqual([]);
        expect(measure.cut).toEqual([]);
        for (const height of measure.railHeadingHeights) {
          expect(height).toBeGreaterThan(MIN_SCREEN_TEXT_PX);
        }
        expect(measure.triggerCoversSearch).toBe(false);
      },
    );
  },
);

describe("at 1440 px", () => {
  const [desktop] = VIEWPORTS;

  it("keeps every class in view labelled and none cut when a chip hides some and the camera refits", async () => {
    const { errors, measure } = await openExplorer(
      "/definitions",
      desktop,
      (page) =>
        page.getByRole("button", { name: "Abstract", exact: true }).click(),
    );
    expect(errors).toEqual([]);
    expect(measure.inView).toBeGreaterThan(0);
    expect(measure.unlabelled).toBe(0);
    expect(measure.minTextPx).toBeGreaterThanOrEqual(MIN_SCREEN_TEXT_PX);
    expect(measure.cut).toEqual([]);
  });

  it("fits a namespace a reader picks legibly, cutting no class", async () => {
    const { errors, measure } = await openExplorer(
      "/definitions",
      desktop,
      (page) =>
        page.getByRole("button", { name: "Fit the graph to ds" }).click(),
    );
    expect(errors).toEqual([]);
    expect(measure.inView).toBeGreaterThan(0);
    expect(measure.unlabelled).toBe(0);
    expect(measure.cut).toEqual([]);
  });

  it("brings every class into view on Fit, as boxes without their labels", async () => {
    const { errors, measure } = await openExplorer(
      "/definitions",
      desktop,
      (page) => page.getByRole("button", { name: "Fit", exact: true }).click(),
    );
    expect(errors).toEqual([]);
    expect(measure.inView).toBe(measure.drawn);
    // Fit trades the labels for the whole graph: at 1440 the docsite's
    // graph fits only below the overview zoom, so every class in view is
    // drawn as its box alone until the reader zooms in.
    expect(measure.unlabelled).toBe(measure.inView);
  });

  it("puts the inspector's field ranges on one column line", async () => {
    const { measure } = await openExplorer(
      `/definitions/${encodeURIComponent("ds:Component")}`,
      desktop,
    );
    expect(measure.rangeLefts.length).toBeGreaterThan(1);
    const [first = 0] = measure.rangeLefts;
    for (const left of measure.rangeLefts) {
      expect(Math.abs(left - first)).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
    }
  });
});
