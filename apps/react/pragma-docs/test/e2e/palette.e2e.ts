// @vitest-environment node

/**
 * The palette and the search page's field from the keyboard, in a real
 * browser. Ctrl+K and a typed text highlight no result, so Enter opens the
 * site's search page for the text; ArrowUp reaches the hand-off line, a
 * link to that page. On the search page `/` focuses its field, Escape
 * clears the field and then leaves it, and Ctrl+K pressed in the field
 * opens the palette on its text.
 */
import { launchBrowser } from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { DEV_READY_MS, PAGE_SETTLE_MS } from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/** How long a navigation or a search may take to settle. */
const SETTLE_MS = PAGE_SETTLE_MS;

let server: RunningServer;
let browser: Browser;
const pages: Page[] = [];

/**
 * Open a tab on `path` at 1440 by 900, serving only the cell's and the
 * graph's origins and leaving the dev server's live-reload socket
 * unconnected, and wait until the page has settled, so the hydrated app
 * receives what the test does next.
 *
 * @note Impure: opens a browser tab.
 */
const openPage = async (path: string): Promise<Page> => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  pages.push(page);
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
