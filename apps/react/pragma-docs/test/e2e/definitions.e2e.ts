// @vitest-environment node

/**
 * The Definitions explorer in a real browser, served by the built preview
 * cell as a reader gets it, at a desktop and a phone width: it hydrates
 * with no console error; it opens at a zoom where every
 * text of the graph renders at 12px or more on screen, the phone view
 * included; every class's label fits its box in the font the page ships;
 * the term rail's ontology headings are laid out; and, on a phone, the
 * inspector's drawer trigger covers nothing of the explorer, its search
 * field least of all.
 */
import {
  launchBrowser,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  DEFINITIONS_PATHS,
  GRAPH_NODE_TEXT_INSET,
  MIN_SCREEN_TEXT_PX,
  PAGE_SETTLE_MS,
  PREVIEW_READY_MS,
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
}

/**
 * Measure the explorer in the page, as the graph heuristics' reviewer
 * does: every visible SVG text's computed size times its screen scale,
 * every graph node's label against its box, the rail's headings and the
 * trigger against the search field.
 */
function measureExplorer(inset: number): ExplorerMeasure {
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
    return {
      errors,
      measure: await page.evaluate(measureExplorer, GRAPH_NODE_TEXT_INSET),
    };
  } finally {
    await page.close();
  }
};

describe.each(VIEWPORTS)("at $name px", (viewport) => {
  it.each(DEFINITIONS_PATHS)(
    "hydrates %s silently, with every graph text legible and every label in its box",
    async (path) => {
      const { errors, measure } = await openExplorer(path, viewport);
      expect(errors).toEqual([]);
      expect(measure.fontLoaded).toBe(true);
      expect(measure.textCount).toBeGreaterThan(0);
      expect(measure.unlabelled).toBe(0);
      expect(measure.minTextPx).toBeGreaterThanOrEqual(MIN_SCREEN_TEXT_PX);
      expect(measure.overflowing).toEqual([]);
      for (const height of measure.railHeadingHeights) {
        expect(height).toBeGreaterThan(MIN_SCREEN_TEXT_PX);
      }
      expect(measure.triggerCoversSearch).toBe(false);
    },
  );
});
