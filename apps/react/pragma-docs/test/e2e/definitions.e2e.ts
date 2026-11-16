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
 * field least of all. A filter chip's refit keeps every class in view
 * labelled and cuts none; a namespace a reader picks, drawn class by class
 * or as one box, is fitted on a window that holds it whole and cuts no box
 * at its edges, a box among its neighbours; at rest Fit brings the whole
 * graph into view, every text at 12px or more, and on a namespace a
 * selection drills into it stops at the overview's floor, on a window that
 * cuts no class; a term page of a class in the largest namespace draws
 * it within the drawn nodes and the band; a pick in the rail keeps the
 * chips, the search and the zoom; the inspector's field rows put their
 * ranges on one column line; and, the lens declaring no namespace, every
 * instance chip of a term's page writes its prefix. Where the map does
 * not fit the canvas at the legible floor, it opens at the map's top-left
 * corner at that floor: the first shelf's boxes whole where they fit, a
 * box the window's edge crosses cut there.
 * A namespace's box is a link, by pointer and by keyboard, to the page
 * drilled into it (`expand=`), whose heading leads back to the overview;
 * that page opens by the overview's rule, at the legible floor from the
 * opened namespace's corner. A term page reached from another frames its
 * class as loading its address does, and so does a move between the
 * overview and a term page that opens or closes a namespace; a move that
 * keeps the drawing keeps the reader's zoom.
 */
import { GRAPH_BUDGET } from "@canonical/prism-core";
import {
  launchBrowser,
  STRIP_VIEWPORTS,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import {
  type BridgeLabelMeasure,
  type CanvasMeasure,
  fetchServedGraph,
  MIN_FIT,
  measureBridgeLabels,
  measureCanvasSvg,
  type ServedWeights,
  sliceCanvasSvg,
  weighServedRelations,
} from "@canonical/prism-lens-definitions/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEFAULT_GRAPHQL_URL } from "../../src/relay/graphqlEndpoint.js";
import {
  CAMERA_SETTLE_MS,
  DEFINITIONS_PATHS,
  GRAPH_NODE_TEXT_INSET,
  INSTANCES_TERM,
  MIN_SCREEN_TEXT_PX,
  PAGE_SETTLE_MS,
  PREVIEW_READY_MS,
  SHORT_DESKTOP_VIEWPORTS,
  WIDTH_TOLERANCE_PX,
} from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/**
 * How far from the canvas's top-left corner an opened namespace's heading
 * may start, in screen px: the view's 16px margin at the legible floor,
 * with a lattice step to spare.
 */
const CORNER_ROOM_PX = 32;

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
  /** Whether the page's font face for 14px semibold text has loaded. */
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
    fontLoaded: document.fonts.check('600 14px "Ubuntu Sans"'),
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

/** A box of the overview's first shelf, and how the viewport shows it. */
interface ShelfBox {
  readonly id: string;
  /** Whether it lies wholly in the viewport. */
  readonly whole: boolean;
  /** Whether any part of it lies in the viewport. */
  readonly met: boolean;
}

/**
 * Measure the overview's first shelf in the page: the boxes whose tops lie
 * above the bottom of the topmost region, grown by every region that
 * starts above it, from the left, each whole in the canvas's viewport,
 * partly in it, or out of it, to within the tolerance of sub-pixel
 * rounding.
 */
function measureFirstShelf(tolerance: number): ShelfBox[] {
  const svg = document.querySelector(".ds.graph-canvas .viewport");
  const viewport = svg?.getBoundingClientRect();
  if (svg === null || viewport === undefined) return [];
  const read = (element: Element, name: string): number =>
    Number(element.getAttribute(`data-${name}`));
  const regions = [...svg.querySelectorAll("g.region")]
    .map((region) => ({ y: read(region, "y"), h: read(region, "h") }))
    .sort((a, b) => a.y - b.y);
  let bottom = Number.NEGATIVE_INFINITY;
  for (const region of regions) {
    if (bottom !== Number.NEGATIVE_INFINITY && region.y >= bottom) break;
    bottom = Math.max(bottom, region.y + region.h);
  }
  return [...svg.querySelectorAll(".node:not(.is-hidden)")]
    .filter((node) => read(node, "y") < bottom)
    .sort((a, b) => read(a, "x") - read(b, "x"))
    .map((node) => {
      const box = (
        node.querySelector(".surface") ?? node
      ).getBoundingClientRect();
      return {
        id: node.getAttribute("data-id") ?? "",
        whole:
          box.left >= viewport.left - tolerance &&
          box.right <= viewport.right + tolerance &&
          box.top >= viewport.top - tolerance &&
          box.bottom <= viewport.bottom + tolerance,
        met:
          box.left < viewport.right - tolerance &&
          box.right > viewport.left + tolerance &&
          box.top < viewport.bottom - tolerance &&
          box.bottom > viewport.top + tolerance,
      };
    });
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
    // The built client asks the default graph address, which the preview
    // cell's graph does not listen on; a client navigation's fetch is sent
    // on to the cell's own graph.
    const fallbackGraph = new URL(DEFAULT_GRAPHQL_URL).origin;
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin === fallbackGraph) {
        return route.continue({
          url: new URL(url.pathname, server.graphBase).href,
        });
      }
      return origins.includes(url.origin)
        ? route.continue()
        : route.fulfill({ status: 204, body: "" });
    });
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

  // The Definitions lens lists terms of several namespaces and declares
  // none, so every instance chip of a term's inspector writes its prefix,
  // the site's own `ds:` included.
  it("writes each instance chip's prefix on a term's page", async () => {
    let instances: readonly { prefix: string; address: string }[] = [];
    const { errors } = await openExplorer(
      `/definitions/${encodeURIComponent(INSTANCES_TERM)}`,
      desktop,
      async (page) => {
        instances = await page
          .locator(".ds.term-inspector .ds.instance-item")
          .evaluateAll((items) =>
            items.map((item) => ({
              prefix:
                item.querySelector(".ds.entity-chip .prefix")?.textContent ??
                "",
              address: item.querySelector("code")?.textContent ?? "",
            })),
          );
      },
    );
    expect(errors).toEqual([]);
    expect(instances.length).toBeGreaterThan(0);
    for (const { prefix, address } of instances) {
      expect(prefix, address).toBe(`${address.split(":").at(0)}:`);
    }
  });

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

  // anatomy and cs are drawn class by class at rest, ds and surface each
  // as one box.
  it.each(["anatomy", "cs", "ds", "surface"])(
    "fits %s when a reader picks it, legibly and cutting no box at the window's edge",
    async (prefix) => {
      const { errors, measure } = await openExplorer(
        "/definitions",
        desktop,
        (page) =>
          page
            .getByRole("button", { name: `Fit the graph to ${prefix}` })
            .click(),
      );
      expect(errors).toEqual([]);
      // A box's window holds its neighbours too, never the box alone.
      expect(measure.inView).toBeGreaterThan(1);
      expect(measure.unlabelled).toBe(0);
      expect(measure.minTextPx).toBeGreaterThanOrEqual(MIN_SCREEN_TEXT_PX);
      expect(measure.cut).toEqual([]);
    },
  );

  // A term page of a class in surface drills into it: its 31 classes,
  // whose fullest layer, 14 classes, is laid as two columns.
  it("draws a surface term page within the drawn nodes and the band", async () => {
    const drawn = { nodes: 0, band: 0, selected: false };
    const { errors } = await openExplorer(
      `/definitions/${encodeURIComponent("surface:Actor")}`,
      desktop,
      async (page) => {
        Object.assign(
          drawn,
          await page.evaluate(() => {
            const nodes = [
              ...document.querySelectorAll(
                ".ds.graph-canvas svg.viewport g.node",
              ),
            ];
            const columns = new Map<string, number>();
            for (const node of nodes) {
              const col = node.getAttribute("data-col") ?? "";
              columns.set(col, (columns.get(col) ?? 0) + 1);
            }
            return {
              nodes: nodes.length,
              band: Math.max(0, ...columns.values()),
              selected: nodes.some(
                (node) => node.getAttribute("data-id") === "surface:Actor",
              ),
            };
          }),
        );
      },
    );
    expect(errors).toEqual([]);
    expect(drawn.selected).toBe(true);
    expect(drawn.nodes).toBeGreaterThan(31);
    expect(drawn.nodes).toBeLessThanOrEqual(GRAPH_BUDGET.drawnNodesMax);
    expect(drawn.band).toBeLessThanOrEqual(GRAPH_BUDGET.bandMembersMax);
  });

  // cs is drawn class by class at rest, so its term page draws the
  // overview's own drawing, on which the reader's zoom still holds.
  it("keeps the chips, the search and the zoom when a rail pick moves to a term the overview draws", async () => {
    const view: {
      before?: string | null;
      pressed?: string | null;
      search?: string;
      after?: string | null;
      path?: string;
    } = {};
    const zoomLevel = ".ds.graph-canvas .zoom-level";
    const { errors, measure } = await openExplorer(
      "/definitions",
      desktop,
      async (page) => {
        await page
          .getByRole("button", { name: "Abstract", exact: true })
          .click();
        await page.getByRole("button", { name: "Zoom in" }).click();
        await page.getByRole("button", { name: "Zoom in" }).click();
        await page.getByRole("searchbox").fill("st");
        await page.waitForTimeout(CAMERA_SETTLE_MS);
        view.before = await page.locator(zoomLevel).textContent();
        await page
          .locator('.ds.term-rail a[href="/definitions/cs%3ACodeStandard"]')
          .click();
        await page.waitForURL(/\/definitions\/cs%3ACodeStandard$/);
        await page.waitForTimeout(CAMERA_SETTLE_MS);
        view.path = new URL(page.url()).pathname;
        view.pressed = await page
          .getByRole("button", { name: "Abstract", exact: true })
          .getAttribute("aria-pressed");
        view.search = await page.getByRole("searchbox").inputValue();
        view.after = await page.locator(zoomLevel).textContent();
      },
    );
    expect(errors).toEqual([]);
    expect(view.path).toBe("/definitions/cs%3ACodeStandard");
    expect(view.pressed).toBe("false");
    expect(view.search).toBe("st");
    expect(view.after).toBe(view.before);
    expect(measure.inView).toBeGreaterThan(0);
  });

  it("opens on the whole map at rest: Fit shows every box, every text at 12px or more", async () => {
    const { errors, measure } = await openExplorer(
      "/definitions",
      desktop,
      async (page) => {
        await page.getByRole("button", { name: "Fit", exact: true }).click();
        await page.waitForTimeout(CAMERA_SETTLE_MS);
      },
    );
    expect(errors).toEqual([]);
    // The overview collapses its largest namespaces until it fits the
    // canvas at the legible zoom, so Fit frames the whole graph: every
    // box drawn is in view, none cut, every visible text at 12px or more.
    expect(measure.drawn).toBeGreaterThan(0);
    expect(measure.inView).toBe(measure.drawn);
    expect(measure.textCount).toBeGreaterThan(0);
    expect(measure.minTextPx).toBeGreaterThanOrEqual(MIN_SCREEN_TEXT_PX);
    expect(measure.cut).toEqual([]);
  });

  it("keeps Fit at the overview's floor on a namespace a selection drills into", async () => {
    const view: { zoom?: string | null } = {};
    const { errors, measure } = await openExplorer(
      `/definitions/${encodeURIComponent("ds:UIBlock")}`,
      desktop,
      async (page) => {
        await page.getByRole("button", { name: "Fit", exact: true }).click();
        await page.waitForTimeout(CAMERA_SETTLE_MS);
        view.zoom = await page
          .locator(".ds.graph-canvas .zoom-level")
          .textContent();
      },
    );
    expect(errors).toEqual([]);
    // The term page draws ds class by class, which the overview draws as
    // one box, and the other namespaces as a box each. A drilled view is
    // not held to the fit: where it fits only below the overview's floor,
    // Fit stops there, on a window whose edges cut no class, every text
    // in view at 12px or more.
    expect(Number.parseInt(view.zoom ?? "", 10)).toBeGreaterThanOrEqual(75);
    expect(measure.inView).toBeGreaterThan(0);
    expect(measure.inView).toBeLessThanOrEqual(measure.drawn);
    expect(measure.textCount).toBeGreaterThan(0);
    expect(measure.minTextPx).toBeGreaterThanOrEqual(MIN_SCREEN_TEXT_PX);
    expect(measure.cut).toEqual([]);
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

describe("the drill through the address, at 1440 px", () => {
  const [desktop] = VIEWPORTS;

  /** The namespaces the canvas draws as one box, by prefix. */
  const listBoxes = (page: Page): Promise<string[]> =>
    page.evaluate(() =>
      [
        ...document.querySelectorAll(
          '.ds.graph-canvas svg.viewport g.node[data-kind="region"]',
        ),
      ].map((node) => node.getAttribute("data-id") ?? ""),
    );

  it("opens a box's namespace from its link, and Back returns to the overview", async () => {
    const seen: { drilled?: string[]; back?: string[]; url?: string } = {};
    const { errors } = await openExplorer(
      "/definitions",
      desktop,
      async (page) => {
        await page
          .locator(
            '.ds.graph-canvas svg.viewport g.node[data-kind="region"][data-id="surface"] a',
          )
          .click();
        await page.waitForURL(/[?&]expand=surface/);
        await page.waitForTimeout(CAMERA_SETTLE_MS);
        seen.drilled = await listBoxes(page);
        await page.goBack();
        await page.waitForURL((url) => !url.search.includes("expand"));
        await page.waitForTimeout(CAMERA_SETTLE_MS);
        seen.back = await listBoxes(page);
        seen.url = page.url();
      },
    );
    expect(errors).toEqual([]);
    expect(seen.drilled).not.toContain("surface");
    expect(seen.drilled).toContain("ds");
    expect(seen.back).toEqual(expect.arrayContaining(["surface", "ds"]));
    expect(new URL(seen.url ?? "").pathname).toBe("/definitions");
  });

  it("reaches a box by Tab from the graph's tab stop, and Enter follows it", async () => {
    const seen: { focused?: string; url?: string } = {};
    const { errors } = await openExplorer(
      "/definitions",
      desktop,
      async (page) => {
        // The boxes follow or precede the classes in the drawing's order.
        for (const key of ["Tab", "Shift+Tab"]) {
          await page
            .locator('.ds.graph-canvas svg.viewport a.target[tabindex="0"]')
            .focus();
          for (let press = 0; press < 6; press += 1) {
            await page.keyboard.press(key);
            seen.focused ??= await page.evaluate(
              () =>
                document.activeElement
                  ?.closest('g.node[data-kind="region"]')
                  ?.getAttribute("data-id") ?? undefined,
            );
            if (seen.focused !== undefined) break;
          }
          if (seen.focused !== undefined) break;
        }
        if (seen.focused === undefined) {
          throw new Error(
            `no box took the focus; it is on ${await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 160))}`,
          );
        }
        await page.keyboard.press("Enter");
        await page.waitForURL(/[?&]expand=/);
        seen.url = page.url();
      },
    );
    expect(errors).toEqual([]);
    expect(seen.focused).toBeDefined();
    expect(new URL(seen.url ?? "").searchParams.get("expand")).toBe(
      seen.focused,
    );
  });

  it.each(["1440", "912"])(
    "opens the address's namespace at %s px by the overview's rule: the legible floor, its heading at the window's top-left corner",
    async (width) => {
      const viewport = [...VIEWPORTS, ...STRIP_VIEWPORTS].find(
        (candidate) => candidate.name === width,
      );
      if (viewport === undefined) throw new Error(`no ${width} viewport`);
      const seen: { zoom?: string | null; corner?: readonly number[] } = {};
      const { errors, measure } = await openExplorer(
        "/definitions?expand=surface",
        viewport,
        async (page) => {
          seen.zoom = await page
            .locator(".ds.graph-canvas .zoom-level")
            .textContent();
          seen.corner = await page.evaluate(() => {
            const frame = document
              .querySelector(".ds.graph-canvas svg.viewport")
              ?.getBoundingClientRect();
            const heading = document
              .querySelector(".ds.graph-canvas svg.viewport a.way-back")
              ?.getBoundingClientRect();
            return frame === undefined || heading === undefined
              ? []
              : [heading.left - frame.left, heading.top - frame.top];
          });
        },
      );
      expect(errors).toEqual([]);
      // The map does not fit the canvas at the legible floor: it opens
      // there, from the map's top-left corner, which is the opened
      // namespace's own, never zoomed to the namespace's height.
      expect(seen.zoom).toBe("86%");
      const [left = Number.NaN, top = Number.NaN] = seen.corner ?? [];
      for (const offset of [left, top]) {
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThanOrEqual(CORNER_ROOM_PX);
      }
      expect(measure.minTextPx).toBeGreaterThanOrEqual(MIN_SCREEN_TEXT_PX);
      expect(measure.unlabelled).toBe(0);
      expect(measure.inView).toBeGreaterThan(1);
    },
  );

  it("leads the way back from the address's namespace to the overview at rest", async () => {
    const seen: { boxes?: string[]; url?: string } = {};
    const back = await openExplorer(
      "/definitions?expand=surface",
      desktop,
      async (page) => {
        await page.locator(".ds.graph-canvas svg.viewport a.way-back").click();
        await page.waitForURL((url) => !url.search.includes("expand"));
        await page.waitForTimeout(CAMERA_SETTLE_MS);
        seen.boxes = await listBoxes(page);
        seen.url = page.url();
      },
    );
    expect(back.errors).toEqual([]);
    expect(seen.boxes).toEqual(expect.arrayContaining(["surface", "ds"]));
    expect(new URL(seen.url ?? "").pathname).toBe("/definitions");
  });
});

describe("a drill's link against its address", () => {
  const [desktop, phone] = VIEWPORTS;

  /**
   * Where the canvas shows a region's top rule on screen, its left end and
   * its length: the camera's window and zoom, read where a reader sees
   * them.
   */
  const readCamera = (page: Page, prefix: string): Promise<readonly number[]> =>
    page.evaluate((ns) => {
      const rule = document.querySelector(
        `.ds.graph-canvas svg.viewport g.region[data-ns="${ns}"] rect.rule`,
      );
      if (rule === null) return [];
      const box = rule.getBoundingClientRect();
      return [box.x, box.y, box.width];
    }, prefix);

  /** Load a path, act, then read the camera on a region. */
  const cameraAfter = async (
    path: string,
    prefix: string,
    act?: (page: Page) => Promise<void>,
  ): Promise<{ errors: readonly string[]; camera: readonly number[] }> => {
    const seen: { camera: readonly number[] } = { camera: [] };
    const { errors } = await openExplorer(path, desktop, async (page) => {
      await act?.(page);
      // The pointer leaves the canvas, so no hover rings a node.
      await page.mouse.move(0, 0);
      await page.waitForTimeout(CAMERA_SETTLE_MS);
      seen.camera = await readCamera(page, prefix);
    });
    return { errors, camera: seen.camera };
  };

  /** Each figure within a pixel of the loaded address's. */
  const expectSameCamera = (
    seen: readonly number[],
    loaded: readonly number[],
  ): void => {
    expect(seen).toHaveLength(loaded.length);
    expect(loaded.length).toBeGreaterThan(0);
    loaded.forEach((value, at) => {
      expect(
        Math.abs((seen.at(at) ?? Number.NaN) - value),
        `[${seen.join(", ")}] against [${loaded.join(", ")}]`,
      ).toBeLessThanOrEqual(1);
    });
  };

  it("lands a box's click on the window and zoom that loading its address opens", async () => {
    const loaded = await cameraAfter("/definitions?expand=surface", "surface");
    const clicked = await cameraAfter(
      "/definitions",
      "surface",
      async (page) => {
        await page
          .locator(
            '.ds.graph-canvas svg.viewport g.node[data-kind="region"][data-id="surface"] a',
          )
          .click();
        await page.waitForURL(/[?&]expand=surface/);
      },
    );
    expect(loaded.errors).toEqual([]);
    expect(clicked.errors).toEqual([]);
    expectSameCamera(clicked.camera, loaded.camera);
  });

  it("lands the way back on the overview at rest that loading it opens", async () => {
    const loaded = await cameraAfter("/definitions", "anatomy");
    const back = await cameraAfter(
      "/definitions?expand=surface",
      "anatomy",
      async (page) => {
        await page.locator(".ds.graph-canvas svg.viewport a.way-back").click();
        await page.waitForURL((url) => !url.search.includes("expand"));
      },
    );
    expect(back.errors).toEqual([]);
    expectSameCamera(back.camera, loaded.camera);
  });

  it("frames a class of a collapsed namespace reached from another term page as loading its address does", async () => {
    const actor = `/definitions/${encodeURIComponent("surface:Actor")}`;
    /** Whether the class's box lies wholly in the canvas's viewport. */
    const isFramed = (page: Page): Promise<boolean> =>
      page.evaluate(() => {
        const frame = document
          .querySelector(".ds.graph-canvas svg.viewport")
          ?.getBoundingClientRect();
        const node = document
          .querySelector(
            '.ds.graph-canvas svg.viewport g.node[data-id="surface:Actor"] .surface',
          )
          ?.getBoundingClientRect();
        return (
          frame !== undefined &&
          node !== undefined &&
          node.width > 0 &&
          node.left >= frame.left &&
          node.right <= frame.right &&
          node.top >= frame.top &&
          node.bottom <= frame.bottom
        );
      });
    const framed: { loaded?: boolean; clicked?: boolean } = {};
    const loaded = await cameraAfter(actor, "surface", async (page) => {
      framed.loaded = await isFramed(page);
    });
    // ds:UIBlock's page opens ds and draws surface as one box; the rail
    // lists surface's classes all the same.
    const clicked = await cameraAfter(
      `/definitions/${encodeURIComponent("ds:UIBlock")}`,
      "surface",
      async (page) => {
        await page.locator(`.ds.term-rail a[href="${actor}"]`).click();
        await page.waitForURL((url) => url.pathname === actor);
        await page.waitForTimeout(CAMERA_SETTLE_MS);
        framed.clicked = await isFramed(page);
      },
    );
    expect(loaded.errors).toEqual([]);
    expect(clicked.errors).toEqual([]);
    expect(framed).toEqual({ loaded: true, clicked: true });
    expectSameCamera(clicked.camera, loaded.camera);
  });

  // The overview draws anatomy and cs class by class, ds and surface each
  // as one box: a term page of a class in ds or surface opens that
  // namespace, a drawing the overview's camera does not belong to.
  it("opens the overview from a term page of a boxed class, by the strip's link, as loading it does", async () => {
    const loaded = await cameraAfter("/definitions", "anatomy");
    const back = await cameraAfter(
      `/definitions/${encodeURIComponent("surface:Actor")}`,
      "anatomy",
      async (page) => {
        await page.locator('.strip a[href="/definitions"]').first().click();
        await page.waitForURL((url) => url.pathname === "/definitions");
      },
    );
    expect(loaded.errors).toEqual([]);
    expect(back.errors).toEqual([]);
    expectSameCamera(back.camera, loaded.camera);
  });

  it("opens a term page of a boxed class from the zoomed overview as loading its address does", async () => {
    const uiBlock = `/definitions/${encodeURIComponent("ds:UIBlock")}`;
    const loaded = await cameraAfter(uiBlock, "ds");
    const picked = await cameraAfter("/definitions", "ds", async (page) => {
      await page.getByRole("button", { name: "Zoom in" }).click();
      await page.getByRole("button", { name: "Zoom in" }).click();
      await page.waitForTimeout(CAMERA_SETTLE_MS);
      await page.locator(`.ds.term-rail a[href="${uiBlock}"]`).click();
      await page.waitForURL((url) => url.pathname === uiBlock);
    });
    expect(loaded.errors).toEqual([]);
    expect(picked.errors).toEqual([]);
    expectSameCamera(picked.camera, loaded.camera);
  });

  it("lists the opened namespace first at 390, its heading the way back", async () => {
    const seen: { first?: string; back?: string | null } = {};
    const { errors } = await openExplorer(
      "/definitions?expand=surface",
      phone,
      async (page) => {
        const first = page.locator("svg.ds.phone-graph g[data-ns]").first();
        seen.first = (await first.getAttribute("data-ns")) ?? undefined;
        seen.back = await first
          .locator("a.way-back")
          .getAttribute("aria-label");
      },
    );
    expect(errors).toEqual([]);
    expect(seen.first).toBe("surface");
    expect(seen.back).toMatch(/surface.*31 classes/);
  });
});

describe("at 912 px, on a canvas narrower than the drawing", () => {
  const tablet = STRIP_VIEWPORTS.find((viewport) => viewport.name === "912");

  it("opens at the map's top-left corner at the legible floor, both boxes and every class whole", async () => {
    if (tablet === undefined) throw new Error("no 912 viewport");
    const view: { shelf?: ShelfBox[] } = {};
    const { errors, measure } = await openExplorer(
      "/definitions",
      tablet,
      async (page) => {
        view.shelf = await page.evaluate(measureFirstShelf, WIDTH_TOLERANCE_PX);
      },
    );
    expect(errors).toEqual([]);
    // The widest window a reader can still read: surface and ds, each
    // drawn as one box, are whole in it; the dt stub after them may be cut
    // by its right edge, the sign that the map goes on, and no class is.
    expect(
      view.shelf
        ?.filter(({ id }) => id === "surface" || id === "ds")
        .map(({ id, whole }) => [id, whole]),
    ).toEqual([
      ["surface", true],
      ["ds", true],
    ]);
    expect(measure.cut.filter((id) => id !== "dt:TokenSymbol")).toEqual([]);
    expect(measure.minTextPx).toBeGreaterThanOrEqual(MIN_SCREEN_TEXT_PX);
    expect(measure.unlabelled).toBe(0);
  });
});

describe("the overview's record, on the docs site", () => {
  const [desktop] = VIEWPORTS;
  const served: { weights?: ServedWeights; prefixes?: readonly string[] } = {};
  const canvases = new Map<string, string>();

  /** The canvas's SVG the server renders for `path`, fetched afresh. */
  const serveCanvas = async (path: string): Promise<string> =>
    sliceCanvasSvg(await (await fetch(new URL(path, server.base))).text());

  /** The overview at rest, then with each namespace opened. */
  const listViews = (): readonly string[] => [
    "/definitions",
    ...(served.prefixes ?? []).map((prefix) => `/definitions?expand=${prefix}`),
  ];

  /** Each view's canvas, as first served, measured. */
  const measureViews = (): [string, CanvasMeasure][] =>
    listViews().map((path) => [
      path,
      measureCanvasSvg(canvases.get(path) ?? ""),
    ]);

  beforeAll(async () => {
    const graph = await fetchServedGraph(
      new URL(new URL(DEFAULT_GRAPHQL_URL).pathname, server.graphBase).href,
    );
    served.weights = weighServedRelations(graph);
    served.prefixes = graph.ontologies.map((ontology) => ontology.prefix);
    for (const path of listViews()) canvases.set(path, await serveCanvas(path));
  }, PAGE_SETTLE_MS);

  it("packs the overview deterministically: two server renders give the same SVG bytes, at rest and opened", async () => {
    expect(canvases.size).toBe(1 + (served.prefixes?.length ?? 0));
    for (const path of listViews()) {
      expect(await serveCanvas(path), path).toBe(canvases.get(path));
    }
  });

  it("labels every drawn bridge at rest, as many as the site's data serves, legibly at the opening zoom", async () => {
    const rest = measureCanvasSvg(canvases.get("/definitions") ?? "");
    // Two bridges, each to a stub: anatomy to rdf:List, ds to dt:TokenSymbol.
    expect(rest.bridges).toBe(served.weights?.bridges);
    expect(rest.bridgeLabels).toBe(rest.bridges);
    const seen: { labels?: readonly BridgeLabelMeasure[] } = {};
    const { errors } = await openExplorer(
      "/definitions",
      desktop,
      async (page) => {
        seen.labels = await page.evaluate(measureBridgeLabels);
      },
    );
    expect(errors).toEqual([]);
    expect(seen.labels).toHaveLength(rest.bridges);
    for (const label of seen.labels ?? []) {
      expect(label.px, label.text).toBeGreaterThanOrEqual(
        GRAPH_BUDGET.labelPxMin,
      );
    }
  });

  it("states each relation's weight by its stroke, 1, 2, 4 or 8 px and dashed exactly at 0, the served count of its heaviest relation", () => {
    const prefixes = served.prefixes ?? [];
    const isClass = (term: string): boolean =>
      prefixes.includes(term.split(":").at(0) ?? "") && term.includes(":");
    let weighed = 0;
    for (const [path, measure] of measureViews()) {
      for (const relation of measure.relations) {
        const name = `${path}: ${relation.from} to ${relation.to}`;
        expect(relation.focus, name).toBe(false);
        expect([1, 2, 4, 8], name).toContain(relation.width);
        expect(relation.dashed, name).toBe(relation.weight === 0);
        if (!isClass(relation.from) || !isClass(relation.to)) continue;
        const pair = [relation.from, relation.to].sort().join(" ");
        expect(relation.weight, name).toBe(served.weights?.weights.get(pair));
        weighed += 1;
      }
    }
    expect(weighed).toBeGreaterThan(0);
  });

  it("measures section C at the design canvas: the fit at the legible floor or above, every node and region on the 16px lattice", () => {
    for (const [path, measure] of measureViews()) {
      expect(measure.openingZoom, path).toBeGreaterThanOrEqual(MIN_FIT);
      expect(measure.offLattice, path).toEqual([]);
    }
  });

  it("draws within the budget at rest and with each namespace opened: nodes, the largest column, bytes and elements", () => {
    for (const [path, measure] of measureViews()) {
      expect(measure.nodes, path).toBeLessThanOrEqual(
        GRAPH_BUDGET.drawnNodesMax,
      );
      expect(measure.largestColumn, path).toBeLessThanOrEqual(
        GRAPH_BUDGET.bandMembersMax,
      );
      expect(measure.bytes, path).toBeLessThanOrEqual(GRAPH_BUDGET.svgBytesMax);
      expect(measure.elements, path).toBeLessThanOrEqual(
        GRAPH_BUDGET.svgElementsMax,
      );
    }
  });
});
