// @vitest-environment node

/**
 * The docs' strip in the browser, at each side of the two-group threshold:
 * one 53px band on every page, nothing in it overflowing and its count
 * whole at every width, the count ending on the band's last line at 1440
 * and 1366, the facet bar one band of the strip's height on the
 * Definitions lens and absent below two groups, the folded renderer menu's
 * options as links that change only `as`, each a full target, the folded
 * sheet covering a phone's viewport, and no link to the retired `view=`
 * anywhere.
 */

import {
  launchBrowser,
  measureStrip,
  STRIP_VIEWPORTS,
  type StripMeasure,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CATALOG_PATH,
  DEV_READY_MS,
  DOCUMENT_PATHS,
  JOURNEYS_PATHS,
  PAGE_SETTLE_MS,
  WORKSPACE_PATH,
  WORKSPACE_PATHS,
} from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/** The strip's height: the density line and one padding above and below. */
const STRIP_HEIGHT_PX = 53;

/** How far a band's height may round, in pixels: the bands are strict. */
const BAND_TOLERANCE_PX = 0.5;

/** How far a measured edge may round, in pixels. */
const EDGE_TOLERANCE_PX = 1;

/** The smallest target a menu option may be, in pixels. */
const MIN_TARGET_PX = 24;

/** The pages whose strip is measured. */
const STRIP_PATHS = [
  ...DOCUMENT_PATHS,
  ...WORKSPACE_PATHS,
  ...JOURNEYS_PATHS,
  CATALOG_PATH,
] as const;

/** The pages whose count closes the strip's filtering group. */
const COUNTED_PATHS = ["/components", WORKSPACE_PATH] as const;

/** A page that offers more than one renderer. */
const SWITCHED_PATH = "/components";

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

describe.each(STRIP_VIEWPORTS)("at $name px", (viewport) => {
  /**
   * Open `path` at this viewport, serving only the app's and the graph's
   * origins.
   *
   * @note Impure: opens a browser tab, which the caller closes.
   */
  const open = async (path: string): Promise<Page> => {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
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
    return page;
  };

  /** Measure the strip of `path`. */
  const measure = async (path: string): Promise<StripMeasure> => {
    const page = await open(path);
    try {
      return await page.evaluate(measureStrip);
    } finally {
      await page.close();
    }
  };

  it("keeps the strip one 53px band on every page, its count whole", async () => {
    for (const path of STRIP_PATHS) {
      const strip = await measure(path);
      expect(
        Math.abs((strip.height ?? 0) - STRIP_HEIGHT_PX),
        path,
      ).toBeLessThanOrEqual(BAND_TOLERANCE_PX);
      expect(strip.overflow, path).toBe(false);
      expect(strip.countClipped, path).toBe(false);
      expect(strip.viewHrefs, path).toEqual([]);
    }
  });

  it("draws the facet bar as one 53px band only on the Definitions lens", async () => {
    expect((await measure(SWITCHED_PATH)).bar).toBeNull();
    const bar = (await measure(WORKSPACE_PATH)).bar;
    if (viewport.width >= 912) {
      expect(Math.abs((bar ?? 0) - STRIP_HEIGHT_PX)).toBeLessThanOrEqual(
        BAND_TOLERANCE_PX,
      );
    } else {
      expect(bar).toBeNull();
    }
  });

  it.runIf(viewport.width >= 1366)(
    "ends the count on the band's last line",
    async () => {
      for (const path of COUNTED_PATHS) {
        const strip = await measure(path);
        expect(strip.countRight, path).not.toBeNull();
        expect(
          Math.abs((strip.countRight ?? 0) - (strip.contentEnd ?? 0)),
          path,
        ).toBeLessThanOrEqual(EDGE_TOLERANCE_PX);
      }
    },
  );

  it.runIf(viewport.width < 912)(
    "lists the offered renderers in the menu, each a link changing only as",
    async () => {
      const page = await open(SWITCHED_PATH);
      try {
        await page.click('[data-slot="view"] summary');
        const menu = await page.evaluate(() =>
          [
            ...document.querySelectorAll<HTMLAnchorElement>(
              '[data-slot="view"] details[open] a[href]',
            ),
          ].map((option) => ({
            href: option.href,
            current: option.getAttribute("aria-current"),
            height: option.getBoundingClientRect().height,
          })),
        );
        const here = new URL(SWITCHED_PATH, server.base);
        expect(menu.length).toBeGreaterThanOrEqual(2);
        expect(menu.filter(({ current }) => current === "page")).toHaveLength(
          1,
        );
        for (const { href, height } of menu) {
          const target = new URL(href);
          target.searchParams.delete("as");
          expect(target.pathname).toBe(here.pathname);
          expect(target.searchParams.toString()).toBe(
            here.searchParams.toString(),
          );
          expect(height).toBeGreaterThanOrEqual(MIN_TARGET_PX);
        }
      } finally {
        await page.close();
      }
    },
  );

  it.runIf(viewport.width < 912)(
    "opens the filter sheet over the whole viewport, nothing scrolling sideways",
    async () => {
      const page = await open(`${WORKSPACE_PATH}?sheet=filter`);
      try {
        const sheet = await page.evaluate(() => {
          const box = document
            .querySelector('[data-region="filter-sheet"][open]')
            ?.getBoundingClientRect();
          return {
            open: box !== undefined,
            width: box?.width ?? 0,
            height: box?.height ?? 0,
            scrolls:
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
          };
        });
        expect(sheet.open).toBe(true);
        expect(sheet.width).toBeCloseTo(viewport.width, 0);
        expect(sheet.height).toBeCloseTo(viewport.height, 0);
        expect(sheet.scrolls).toBe(false);
      } finally {
        await page.close();
      }
    },
  );
});
