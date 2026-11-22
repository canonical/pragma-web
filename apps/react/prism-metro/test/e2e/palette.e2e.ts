// @vitest-environment node

/**
 * The palette and the search page's field from the keyboard, in a real
 * browser. Ctrl+K and a typed text highlight no result, so Enter opens the
 * site's search page for the text; ArrowUp reaches the hand-off line, a
 * link to that page. On the search page `/` focuses its field, Escape
 * clears the field and then leaves it, and Ctrl+K pressed in the field
 * opens the palette on its text. On the search page at 390 the strip's
 * fold reaches the field; at 1440 each result's chip is as wide as its
 * text and the facet bar keeps its content inside its one line.
 */
import { launchBrowser } from "@canonical/prism-core/testing/browser";
import type { Browser, Page, ViewportSize } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  CLICK_SETTLE_MS,
  DESKTOP_VIEWPORT,
  DEV_READY_MS,
  GRAPH_READY_MS,
  PAGE_SETTLE_MS,
  PHONE_VIEWPORT,
  SEARCH_MIXED_TEXT,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** How long a navigation or a search may take to settle. */
const SETTLE_MS = CLICK_SETTLE_MS;

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;
const pages: Page[] = [];

/**
 * Open a tab on `path` at `viewport` (1440 by 900 unless given), serving
 * only the cell's and the graph's origins, fonts answered empty and the
 * dev cell's live-reload socket left unconnected, and wait until the page
 * has settled, so the hydrated app receives what the test does next.
 *
 * @note Impure: opens a browser tab.
 */
const openPage = async (
  path: string,
  viewport: ViewportSize = DESKTOP_VIEWPORT,
): Promise<Page> => {
  const page = await browser.newPage({ viewport });
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
  await page.goto(new URL(path, server.base).href, {
    waitUntil: "networkidle",
    timeout: PAGE_SETTLE_MS,
  });
  return page;
};

/** The palette's dialog. */
const findPalette = (page: Page) => page.locator("dialog.command-palette");

/** Whether the palette's dialog is open. */
const readOpen = (page: Page): Promise<boolean> =>
  findPalette(page).evaluate((dialog) => {
    if (!(dialog instanceof HTMLDialogElement)) {
      throw new Error("the palette is not a dialog");
    }
    return dialog.open;
  });

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

describe("the palette and the search page's field, from the keyboard", () => {
  it("opens the search page with Enter on a typed text, no result highlighted (W8-A4)", async () => {
    const page = await openPage("/");
    await page.keyboard.press("Control+k");
    await page.keyboard.type("but");
    await findPalette(page)
      .getByRole("link", { name: "Search everything for “but”" })
      .waitFor({ timeout: SETTLE_MS });
    expect(
      await findPalette(page).getByRole("option", { selected: true }).count(),
    ).toBe(0);
    await page.keyboard.press("Enter");
    await page.waitForURL(
      (url) =>
        url.pathname === "/search" && url.searchParams.get("q") === "but",
      { timeout: SETTLE_MS },
    );
    expect(await readOpen(page)).toBe(false);
  });

  it("reaches the hand-off line with ArrowUp and follows it with Enter (W8-A4)", async () => {
    const page = await openPage("/");
    await page.keyboard.press("Control+k");
    await page.keyboard.type("but");
    const handoff = findPalette(page).getByRole("link", {
      name: "Search everything for “but”",
    });
    await handoff.waitFor({ timeout: SETTLE_MS });
    expect(await handoff.getAttribute("href")).toBe("/search?q=but");
    await page.keyboard.press("ArrowUp");
    expect(
      await findPalette(page)
        .getByRole("combobox")
        .getAttribute("aria-activedescendant"),
    ).toBe(await handoff.getAttribute("id"));
    await page.keyboard.press("Enter");
    await page.waitForURL((url) => url.pathname === "/search", {
      timeout: SETTLE_MS,
    });
  });

  it("focuses the field on /, clears it and leaves it on Escape, and carries its text into the palette on Ctrl+K (W8-A10)", async () => {
    const page = await openPage("/search");
    const field = page.getByRole("searchbox");
    const isFocused = (): Promise<boolean> =>
      field.evaluate((element) => element === document.activeElement);
    await page.keyboard.press("/");
    expect(await isFocused()).toBe(true);
    await page.keyboard.type("but");
    expect(await field.inputValue()).toBe("but");
    await page.keyboard.press("Escape");
    expect(await field.inputValue()).toBe("");
    expect(await isFocused()).toBe(true);
    await page.keyboard.press("Escape");
    expect(await isFocused()).toBe(false);
    await page.keyboard.press("/");
    await page.keyboard.type("but");
    await page.keyboard.press("Control+k");
    expect(await readOpen(page)).toBe(true);
    expect(await findPalette(page).getByRole("combobox").inputValue()).toBe(
      "but",
    );
  });
});

describe("the search page's bands and results", () => {
  it("reaches a field named q through the strip's fold at 390", async () => {
    const page = await openPage(
      `/search?q=${SEARCH_MIXED_TEXT}`,
      PHONE_VIEWPORT,
    );
    await page.locator("a.filter-fold").click();
    await page.waitForURL((url) => url.searchParams.get("sheet") === "filter", {
      timeout: SETTLE_MS,
    });
    const field = page.locator('dialog.filter-sheet[open] input[name="q"]');
    await field.waitFor({ state: "visible", timeout: SETTLE_MS });
    expect(await field.inputValue()).toBe(SEARCH_MIXED_TEXT);
    expect(await field.isEditable()).toBe(true);
  });

  it("draws each result's chip no wider than its text", async () => {
    const page = await openPage(`/search?q=${SEARCH_MIXED_TEXT}`);
    const overhangs = await page
      .locator(".result > .ds.entity-chip")
      .evaluateAll((chips) =>
        chips.map((chip) => {
          const range = document.createRange();
          range.selectNodeContents(chip);
          const style = getComputedStyle(chip);
          const frame = [
            style.paddingInlineStart,
            style.paddingInlineEnd,
            style.borderInlineStartWidth,
            style.borderInlineEndWidth,
          ].reduce((sum, length) => sum + Number.parseFloat(length), 0);
          return (
            chip.getBoundingClientRect().width -
            (range.getBoundingClientRect().width + frame)
          );
        }),
      );
    expect(overhangs.length).toBeGreaterThan(0);
    for (const overhang of overhangs) {
      expect(overhang).toBeLessThanOrEqual(1);
    }
  });

  it("holds the facet bar to one line, its content inside its box", async () => {
    const page = await openPage(`/search?q=${SEARCH_MIXED_TEXT}`);
    const bar = page.locator(".ds.filter-bar");
    await bar.waitFor({ state: "visible", timeout: SETTLE_MS });
    const { scrollHeight, clientHeight } = await bar.evaluate((element) => ({
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));
    expect(scrollHeight).toBe(clientHeight);
  });
});
