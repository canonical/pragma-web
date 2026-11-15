// @vitest-environment node

/**
 * A chip's peek in a real browser, end to end: the metro graph in its own
 * process, the dev cell pointed at it, and Chromium on a station's page,
 * whose "Instance of" line holds the chip of the station's class. With a
 * mouse the peek opens no sooner than `PEEK_OPEN_DELAY_MS` after the
 * pointer comes to rest on the chip, and Escape closes it; focus opens it
 * at once. Open, it is a dialog inside no link, with a link a pointer
 * reaches, 248px wide, 4px from the chip, in the first of its places that
 * fits the viewport, and wholly inside it, at 1440 and at 390, its
 * address line and Copy inside it; for a chip low in the viewport that
 * place is above it, and a card taller than the room there scrolls inside
 * the peek under its address line, which stays in view. Escape
 * from inside it closes it and gives the chip's link the focus back. On a
 * touch screen at 390 a tap opens no peek and follows the chip's link.
 */
import {
  launchBrowser,
  listPeekViolations,
  measurePeek,
  placePeek,
  VIEWPORTS,
  watchPeek,
} from "@canonical/prism-core/testing/browser";
import { PEEK_OPEN_DELAY_MS } from "@canonical/prism-projections";
import type { Browser, BrowserContextOptions, Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { NORTHGATE_CURIE } from "../../testing/fixtures.js";
import {
  CLICK_SETTLE_MS,
  DEV_READY_MS,
  GRAPH_READY_MS,
  PAGE_SETTLE_MS,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** A station's page, whose "Instance of" line holds its class's chip. */
const STATION_PATH = `/stations/${encodeURIComponent(NORTHGATE_CURIE)}`;

/** The chip of the station's class, which peeks at the class's card. */
const CHIP_SELECTOR = "main.ds.canvas .ds.ontology-class-chip";

/** The chip's link. */
const CHIP_LINK_SELECTOR = `${CHIP_SELECTOR} > a[href]`;

/** The open peek, mounted on the document's body. */
const PEEK_SELECTOR = "body > .ds.peek";

/** The phone's viewport. */
const PHONE = VIEWPORTS.at(1);
if (PHONE === undefined) {
  throw new Error("the browser constants list no phone viewport");
}

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;
const pages: Page[] = [];

/**
 * Open the station's page at a viewport, serving only the cell's and the
 * graph's origins and leaving every WebSocket unconnected, wait until it
 * has settled, and watch its class's chip.
 *
 * @note Impure: opens a browser tab.
 */
const openStation = async (
  options: BrowserContextOptions = { viewport: { width: 1440, height: 900 } },
): Promise<Page> => {
  const page = await browser.newPage(options);
  pages.push(page);
  const origins = new Set([
    new URL(server.base).origin,
    new URL(graph.base).origin,
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
      // Left unconnected, the socket opens and stays silent.
    },
  );
  await page.goto(new URL(STATION_PATH, server.base).href, {
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

/** The room left under a chip brought low: two chips' heights, less than any peek. */
const LOW_CHIP_ROOM_PX = 56;

/**
 * Bring the chip low in the viewport: scroll it to the end of every box
 * that scrolls it, then cut the viewport's height to just under it, so the
 * room below it is smaller than any peek and above it is the larger side.
 *
 * @note Impure: scrolls and resizes the tab.
 */
const bringChipLow = async (page: Page): Promise<void> => {
  const bottom = await page.locator(CHIP_SELECTOR).evaluate((chip) => {
    chip.scrollIntoView({ block: "end" });
    return chip.getBoundingClientRect().bottom;
  });
  const width = page.viewportSize()?.width ?? 1440;
  await page.setViewportSize({
    width,
    height: Math.ceil(bottom) + LOW_CHIP_ROOM_PX,
  });
};

/**
 * Whether the open peek, or a box inside it, scrolls content taller than
 * itself. Runs in the page.
 */
const readPeekScrolls = (selector: string): boolean => {
  const peek = document.querySelector(selector);
  if (peek === null) return false;
  return [peek, ...peek.querySelectorAll("*")].some((box) => {
    const { overflowY } = getComputedStyle(box);
    return (
      (overflowY === "auto" || overflowY === "scroll") &&
      box.scrollHeight > box.clientHeight + 1
    );
  });
};

/**
 * Whether the open peek's address line, and its Copy button, lie wholly
 * inside the peek's box: the line is pinned to the peek's foot, so the
 * CURIE and Copy show however tall the card. Runs in the page.
 */
const readAddressShown = (selector: string): boolean => {
  const peek = document.querySelector(selector);
  const address = peek?.querySelector(":scope > * > .address");
  const copy = address?.querySelector("button");
  if (peek == null || address == null || copy == null) return false;
  const frame = peek.getBoundingClientRect();
  return [address, copy].every((part) => {
    const box = part.getBoundingClientRect();
    return (
      box.height > 0 &&
      box.top >= frame.top - 0.5 &&
      box.bottom <= frame.bottom + 0.5 &&
      box.left >= frame.left - 0.5 &&
      box.right <= frame.right + 0.5
    );
  });
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

afterEach(async () => {
  for (const page of pages.splice(0)) {
    await page.close();
  }
});

afterAll(async () => {
  await browser?.close();
  await server?.stop();
  await graph?.stop();
});

describe("a chip's peek on a station's page", () => {
  it("opens on hover after the named delay, and Escape closes it", async () => {
    const page = await openStation();
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
      const page = await openStation({ viewport: { width, height } });
      await page.locator(CHIP_LINK_SELECTOR).focus();
      const measure = await readOpenPeek(page);
      const { focused, opened } = measure.times;
      expect(focused).toBeDefined();
      expect(opened).toBeDefined();
      expect((opened ?? 0) - (focused ?? 0)).toBeLessThan(PEEK_OPEN_DELAY_MS);
      expect(listPeekViolations(measure)).toEqual([]);
      expect(await page.evaluate(readAddressShown, PEEK_SELECTOR)).toBe(true);
    },
  );

  it("opens above a chip low in the viewport, inside it, scrolling a card taller than its room", async () => {
    const page = await openStation();
    await bringChipLow(page);
    await page.locator(CHIP_LINK_SELECTOR).focus();
    const measure = await readOpenPeek(page);
    expect(measure.chip.top).toBeGreaterThan(measure.viewport.height / 2);
    expect(listPeekViolations(measure)).toEqual([]);
    expect(placePeek(measure).actual.block).toBe("above");
    expect(await page.evaluate(readPeekScrolls, PEEK_SELECTOR)).toBe(true);
    expect(await page.evaluate(readAddressShown, PEEK_SELECTOR)).toBe(true);
  });

  it("closes on Escape from inside the peek and gives the chip's link the focus back", async () => {
    const page = await openStation();
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
    const page = await openStation({
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
      timeout: CLICK_SETTLE_MS,
    });
    const times = await page.evaluate(() =>
      Reflect.get(window, "__prismPeekTimes"),
    );
    expect(times.opened).toBeUndefined();
  });
});
