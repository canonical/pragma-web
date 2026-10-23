// @vitest-environment node

/**
 * The command palette in a real browser, end to end: the metro graph in its
 * own process, the dev cell pointed at it, and Chromium driving the palette
 * as a reader does. Ctrl+K opens it with the field focused; a station's
 * title lists its matches with the first highlighted and its card in the
 * preview; the arrow keys move the highlight and the preview with it; Enter
 * opens the highlighted result's home without loading a new document and
 * closes the palette, as following the preview's link does; Cmd+K reopens
 * it empty and Escape closes it. On a phone the open palette fits the
 * viewport less a gutter at each side, scrolls nothing sideways, and shows
 * no preview.
 */
import {
  launchBrowser,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { NORTHGATE_TITLE } from "../../testing/fixtures.js";
import {
  CLICK_SETTLE_MS,
  DEV_READY_MS,
  GRAPH_READY_MS,
  PAGE_SETTLE_MS,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** The window property a page sets to prove no new document loaded. */
const DOCUMENT_MARKER = "__metroDocumentMarker";

/** The phone's viewport, where the palette re-flows. */
const PHONE = VIEWPORTS.at(1);
if (PHONE === undefined) {
  throw new Error("the browser constants list no phone viewport");
}

/** The gutter the open palette leaves at each side of a phone's viewport. */
const PHONE_GUTTER_PX = 16;

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;
const pages: Page[] = [];

/**
 * Open a tab on the landing at `viewport`, serving only the cell's and the
 * graph's origins, fonts answered empty and the dev cell's live-reload
 * socket left unconnected, and wait until the page has settled, so the
 * hydrated app receives what the test does next.
 *
 * @note Impure: opens a browser tab.
 */
const openLanding = async (
  viewport: { readonly width: number; readonly height: number } = {
    width: 1440,
    height: 900,
  },
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
    .waitFor({ timeout: CLICK_SETTLE_MS });
};

/** The title of the highlighted result. */
const readSelectedTitle = (page: Page): Promise<string | null> =>
  findPalette(page)
    .getByRole("option", { selected: true })
    .locator(".title")
    .textContent();

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

describe("the command palette", () => {
  it("opens with Ctrl+K, the field focused", async () => {
    const page = await openLanding();
    await page.keyboard.press("Control+k");
    expect(await readOpen(page)).toBe(true);
    await expect(
      findPalette(page)
        .getByRole("combobox", { name: "Search the graph" })
        .evaluate((field) => field === document.activeElement),
    ).resolves.toBe(true);
  });

  it("lists a station's matches, the first highlighted and previewed", async () => {
    const page = await openLanding();
    await search(page, NORTHGATE_TITLE);
    const options = findPalette(page).getByRole("option");
    expect(await options.count()).toBeGreaterThan(1);
    expect(await options.first().getAttribute("aria-selected")).toBe("true");
    expect(await readSelectedTitle(page)).toBe(NORTHGATE_TITLE);
    expect(await findPreviewLink(page).textContent()).toBe(NORTHGATE_TITLE);
  });

  it("moves the highlight and the preview with the arrow keys", async () => {
    const page = await openLanding();
    await search(page, NORTHGATE_TITLE);
    const field = findPalette(page).getByRole("combobox");
    const first = await field.getAttribute("aria-activedescendant");
    await page.keyboard.press("ArrowDown");
    const second = await field.getAttribute("aria-activedescendant");
    expect(second).not.toBe(first);
    const selected = findPalette(page).getByRole("option", { selected: true });
    expect(await selected.getAttribute("id")).toBe(second);
    expect(
      await findPalette(page)
        .getByRole("region", { name: "Preview" })
        .locator(".title")
        .first()
        .textContent(),
    ).toBe(await readSelectedTitle(page));
  });

  it("opens the highlighted result's home with Enter, without loading a new document", async () => {
    const page = await openLanding();
    await page.evaluate((marker) => {
      Reflect.set(window, marker, true);
    }, DOCUMENT_MARKER);
    await search(page, NORTHGATE_TITLE);
    const home = await findPreviewLink(page).getAttribute("href");
    expect(home).not.toBeNull();
    await page.keyboard.press("Enter");
    await page
      .getByRole("heading", { level: 1, name: NORTHGATE_TITLE })
      .waitFor({ timeout: CLICK_SETTLE_MS });
    expect(new URL(page.url()).pathname).toBe(home);
    expect(await readOpen(page)).toBe(false);
    expect(
      await page.evaluate(
        (marker) => Reflect.get(window, marker),
        DOCUMENT_MARKER,
      ),
    ).toBe(true);
  });

  it("closes when the preview's link is followed, opening its home in place", async () => {
    const page = await openLanding();
    await page.evaluate((marker) => {
      Reflect.set(window, marker, true);
    }, DOCUMENT_MARKER);
    await search(page, NORTHGATE_TITLE);
    const home = await findPreviewLink(page).getAttribute("href");
    expect(home).not.toBeNull();
    await findPreviewLink(page).click();
    await page
      .getByRole("heading", { level: 1, name: NORTHGATE_TITLE })
      .waitFor({ timeout: CLICK_SETTLE_MS });
    expect(new URL(page.url()).pathname).toBe(home);
    expect(await readOpen(page)).toBe(false);
    expect(
      await page.evaluate(
        (marker) => Reflect.get(window, marker),
        DOCUMENT_MARKER,
      ),
    ).toBe(true);
  });

  it("reopens empty with Cmd+K and closes on Escape", async () => {
    const page = await openLanding();
    await search(page, NORTHGATE_TITLE);
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
    const page = await openLanding(PHONE);
    await search(page, NORTHGATE_TITLE);
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
