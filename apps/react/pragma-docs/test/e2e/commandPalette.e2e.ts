// @vitest-environment node

/**
 * The command palette in a real browser, end to end: the dev cell (its
 * graph server alongside) serves the lobby, and Chromium drives the palette
 * as a reader does. Ctrl+K opens it with the field focused; a component's
 * title lists its matches with the first highlighted and its card in the
 * preview; the arrow keys move the highlight and the preview with it; Enter
 * opens the highlighted result's home without loading a new document and
 * closes the palette; Cmd+K reopens it empty and Escape closes it. On a
 * phone the open palette fits the viewport less a gutter at each side,
 * scrolls nothing sideways, and shows no preview.
 */
import {
  launchBrowser,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { COMPONENT_TITLE } from "../../testing/fixtures.js";
import { DEV_READY_MS, PAGE_SETTLE_MS } from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/** The window property a page sets to prove no new document loaded. */
const DOCUMENT_MARKER = "__docsDocumentMarker";

/** The phone's viewport, where the palette re-flows. */
const PHONE = VIEWPORTS[1];

/** The gutter the open palette leaves at each side of a phone's viewport. */
const PHONE_GUTTER_PX = 16;

let server: RunningServer;
let browser: Browser;
const pages: Page[] = [];

/**
 * Open a tab on the lobby at `viewport`, serving only the cell's and the
 * graph's origins and leaving the dev server's live-reload socket
 * unconnected, and wait until the page has settled, so the hydrated app
 * receives what the test does next.
 *
 * @note Impure: opens a browser tab.
 */
const openLobby = async (
  viewport: { readonly width: number; readonly height: number } = {
    width: 1440,
    height: 900,
  },
): Promise<Page> => {
  const page = await browser.newPage({ viewport });
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
  await page.goto(new URL("/", server.base).href, {
    waitUntil: "networkidle",
    timeout: PAGE_SETTLE_MS,
  });
  return page;
};

/** The palette's dialog. */
const findPalette = (page: Page) => page.locator("dialog.command-palette");

/**
 * Open the palette with `chord` and search for `text`, waiting until a
 * result is highlighted.
 *
 * @note Impure: drives the tab.
 */
const search = async (page: Page, text: string, chord = "Control+k") => {
  await page.keyboard.press(chord);
  await page.keyboard.type(text);
  await findPalette(page)
    .getByRole("option", { selected: true })
    .waitFor({ timeout: PAGE_SETTLE_MS });
};

/** The title of the highlighted result. */
const readSelectedTitle = (page: Page): Promise<string | null> =>
  page.getByRole("option", { selected: true }).locator(".title").textContent();

/** The title link of the card in the preview. */
const findPreviewLink = (page: Page) =>
  findPalette(page)
    .getByRole("region", { name: "Preview" })
    .getByRole("link")
    .first();

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

describe("the command palette", () => {
  it("opens with Ctrl+K, the field focused", async () => {
    const page = await openLobby();
    await page.keyboard.press("Control+k");
    expect(await readOpen(page)).toBe(true);
    await expect(
      page
        .getByRole("combobox", { name: "Search the graph" })
        .evaluate((field) => field === document.activeElement),
    ).resolves.toBe(true);
  });

  it("lists a component's matches, the first highlighted and previewed", async () => {
    const page = await openLobby();
    await search(page, COMPONENT_TITLE);
    const options = findPalette(page).getByRole("option");
    expect(await options.count()).toBeGreaterThan(1);
    expect(await options.first().getAttribute("aria-selected")).toBe("true");
    expect(await findPreviewLink(page).textContent()).toBe(
      await readSelectedTitle(page),
    );
  });

  it("moves the highlight and the preview with the arrow keys", async () => {
    const page = await openLobby();
    await search(page, COMPONENT_TITLE);
    const field = findPalette(page).getByRole("combobox");
    const first = await field.getAttribute("aria-activedescendant");
    await page.keyboard.press("ArrowDown");
    const second = await field.getAttribute("aria-activedescendant");
    expect(second).not.toBe(first);
    const selected = findPalette(page).getByRole("option", { selected: true });
    expect(await selected.getAttribute("id")).toBe(second);
    expect(await findPreviewLink(page).textContent()).toBe(
      await readSelectedTitle(page),
    );
  });

  it("opens the highlighted result's home with Enter, without loading a new document", async () => {
    const page = await openLobby();
    await page.evaluate((marker) => {
      Reflect.set(window, marker, true);
    }, DOCUMENT_MARKER);
    await search(page, COMPONENT_TITLE);
    const home = await findPreviewLink(page).getAttribute("href");
    expect(home).not.toBeNull();
    await page.keyboard.press("Enter");
    await page.waitForURL((url) => url.pathname === home, {
      timeout: PAGE_SETTLE_MS,
    });
    expect(await readOpen(page)).toBe(false);
    expect(
      await page.evaluate(
        (marker) => Reflect.get(window, marker),
        DOCUMENT_MARKER,
      ),
    ).toBe(true);
  });

  it("reopens empty with Cmd+K and closes on Escape", async () => {
    const page = await openLobby();
    await search(page, COMPONENT_TITLE);
    await page.keyboard.press("Escape");
    expect(await readOpen(page)).toBe(false);
    await page.keyboard.press("Meta+k");
    expect(await readOpen(page)).toBe(true);
    expect(await findPalette(page).getByRole("combobox").inputValue()).toBe("");
    expect(await findPalette(page).getByRole("option").count()).toBe(0);
    await page.keyboard.press("Escape");
    expect(await readOpen(page)).toBe(false);
  });

  it("fits a phone's viewport, scrolls nothing sideways and hides the preview", async () => {
    const page = await openLobby(PHONE);
    await search(page, COMPONENT_TITLE);
    const box = await findPalette(page).evaluate((dialog) => ({
      width: dialog.getBoundingClientRect().width,
      scrollWidth: dialog.scrollWidth,
      clientWidth: dialog.clientWidth,
      pageScrollWidth: document.documentElement.scrollWidth,
    }));
    expect(box.width).toBeLessThanOrEqual(PHONE.width - 2 * PHONE_GUTTER_PX);
    expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
    expect(box.pageScrollWidth).toBeLessThanOrEqual(PHONE.width);
    expect(await findPalette(page).locator(".preview").isVisible()).toBe(false);
  });
});
