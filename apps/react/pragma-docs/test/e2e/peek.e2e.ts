// @vitest-environment node

/**
 * A chip's peek in a real browser, end to end: the dev cell (its graph
 * server alongside) serves the lobby, whose examples are chips of the
 * design system's blocks, and Chromium reads the first of them. With a
 * mouse the peek opens no sooner than `PEEK_OPEN_DELAY_MS` after the
 * pointer comes to rest on the chip, and Escape closes it; focus opens it
 * at once. Open, it is a dialog inside no link, with a link a pointer
 * reaches, 248px wide, 4px from the chip, in the first of its places that
 * fits the viewport, and wholly inside it, at 1440 and at 390. Escape
 * from inside it closes it and gives the chip's link the focus back. On a
 * touch screen at 390 a tap opens no peek and follows the chip's link.
 */
import {
  launchBrowser,
  listPeekViolations,
  measurePeek,
  VIEWPORTS,
  watchPeek,
} from "@canonical/prism-core/testing/browser";
import { PEEK_OPEN_DELAY_MS } from "@canonical/prism-projections";
import type { Browser, BrowserContextOptions, Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { DEV_READY_MS, PAGE_SETTLE_MS } from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/** The lobby's first example, a block's chip, which peeks at its card. */
const CHIP_SELECTOR =
  "main.ds.canvas .ds.lobby .exemplars > li:first-child > .ds.entity-chip";

/** The chip's link. */
const CHIP_LINK_SELECTOR = `${CHIP_SELECTOR} > a[href]`;

/** The open peek, mounted on the document's body. */
const PEEK_SELECTOR = "body > .ds.peek";

/** The phone's viewport. */
const PHONE = VIEWPORTS.at(1);
if (PHONE === undefined) {
  throw new Error("the browser constants list no phone viewport");
}

let server: RunningServer;
let browser: Browser;
const pages: Page[] = [];

/**
 * Open the lobby at a viewport, serving only the cell's and the graph's
 * origins and leaving the dev server's live-reload socket unconnected,
 * wait until it has settled, and watch its first example's chip.
 *
 * @note Impure: opens a browser tab.
 */
const openLobby = async (
  options: BrowserContextOptions = { viewport: { width: 1440, height: 900 } },
): Promise<Page> => {
  const page = await browser.newPage(options);
  pages.push(page);
  const origins = new Set([
    new URL(server.base).origin,
    new URL(server.graphBase).origin,
  ]);
  await page.route("**/*", (route) => {
    const request = route.request();
    return origins.has(new URL(request.url()).origin) &&
      request.resourceType() !== "font"
      ? route.continue()
      : route.fulfill({ status: 204, body: "" });
  });
  await page.routeWebSocket(
    () => true,
    () => {
      // Left unconnected, the dev server's live-reload socket stays silent.
    },
  );
  await page.goto(new URL("/", server.base).href, {
    waitUntil: "networkidle",
    timeout: PAGE_SETTLE_MS,
  });
  await page.evaluate(watchPeek, CHIP_SELECTOR);
  return page;
};

/**
 * Wait until the peek shows its card, then measure it with its chip.
 *
 * @note Impure: reads the tab.
 */
const readOpenPeek = async (page: Page) => {
  await page
    .locator(PEEK_SELECTOR)
    .waitFor({ state: "visible", timeout: PAGE_SETTLE_MS });
  return page.evaluate(measurePeek, CHIP_SELECTOR);
};

beforeAll(async () => {
  server = await startServer("dev:bun", CWD, { timeoutMs: DEV_READY_MS });
  browser = await launchBrowser();
}, DEV_READY_MS + PAGE_SETTLE_MS);

afterEach(async () => {
  for (const page of pages.splice(0)) {
    await page.close();
  }
});

afterAll(async () => {
  await browser?.close();
  await server?.stop();
});

describe("a chip's peek in the lobby", () => {
  it("opens on hover after the named delay, and Escape closes it", async () => {
    const page = await openLobby();
    await page.locator(CHIP_LINK_SELECTOR).hover();
    const measure = await readOpenPeek(page);
    const { entered, opened } = measure.times;
    expect(entered).toBeDefined();
    expect(opened).toBeDefined();
    expect((opened ?? 0) - (entered ?? 0)).toBeGreaterThanOrEqual(
      PEEK_OPEN_DELAY_MS,
    );
    expect(listPeekViolations(measure)).toEqual([]);
    await page.keyboard.press("Escape");
    expect(await page.locator(PEEK_SELECTOR).count()).toBe(0);
  });

  it.each(VIEWPORTS)(
    "opens at once on focus at $name px, inside the viewport",
    async ({ width, height }) => {
      const page = await openLobby({ viewport: { width, height } });
      await page.locator(CHIP_LINK_SELECTOR).focus();
      const measure = await readOpenPeek(page);
      const { focused, opened } = measure.times;
      expect(focused).toBeDefined();
      expect(opened).toBeDefined();
      expect((opened ?? 0) - (focused ?? 0)).toBeLessThan(PEEK_OPEN_DELAY_MS);
      expect(listPeekViolations(measure)).toEqual([]);
    },
  );

  it("closes on Escape from inside the peek and gives the chip's link the focus back", async () => {
    const page = await openLobby();
    await page.locator(CHIP_LINK_SELECTOR).focus();
    await readOpenPeek(page);
    await page.locator(`${PEEK_SELECTOR} a[href]`).first().focus();
    expect(await page.locator(PEEK_SELECTOR).isVisible()).toBe(true);
    await page.keyboard.press("Escape");
    expect(await page.locator(PEEK_SELECTOR).count()).toBe(0);
    const measure = await page.evaluate(measurePeek, CHIP_SELECTOR);
    expect(measure.chipLinkFocused).toBe(true);
  });

  it("follows the chip's link on a tap at 390 px and opens no peek", async () => {
    const page = await openLobby({
      viewport: { width: PHONE.width, height: PHONE.height },
      hasTouch: true,
      isMobile: true,
    });
    const link = page.locator(CHIP_LINK_SELECTOR);
    const href = await link.getAttribute("href");
    if (href === null) throw new Error("the chip's link has no href");
    const home = new URL(href, server.base).pathname;
    await link.tap();
    await page.waitForURL((url) => url.pathname === home, {
      timeout: PAGE_SETTLE_MS,
    });
    const times = await page.evaluate(() =>
      Reflect.get(window, "__prismPeekTimes"),
    );
    expect(times.opened).toBeUndefined();
  });
});
