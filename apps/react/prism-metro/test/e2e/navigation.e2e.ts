// @vitest-environment node

import { launchBrowser } from "@canonical/prism-core/testing/browser";
/**
 * The landing and the lenses in a real browser, end to end: the metro graph
 * in its own process, each server-rendering web cell pointed at it, and
 * Chromium reading the pages. What is asserted is what a reader sees: a
 * click on a door of the landing or on an index entry opens its page without
 * loading a new document, the rail's brand leads back to the landing, Back
 * returns to the index, and every page hydrates without a console error.
 */
import type { Browser, Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  CIRCLE_LINE_CURIE,
  CIRCLE_LINE_TITLE,
  NORTHGATE_CURIE,
  NORTHGATE_TITLE,
  STATION_CLASS_CURIE,
} from "../../testing/fixtures.js";
import {
  CLICK_SETTLE_MS,
  DEV_READY_MS,
  GRAPH_READY_MS,
  PREVIEW_READY_MS,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

const CELLS = [
  { script: "dev:bun", timeoutMs: DEV_READY_MS },
  { script: "preview:bun", timeoutMs: PREVIEW_READY_MS },
] as const;

/** The station's page in the stations lens. */
const NORTHGATE_PATH = `/stations/${encodeURIComponent(NORTHGATE_CURIE)}`;

/** The line's page in the lines lens. */
const CIRCLE_LINE_PATH = `/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`;

/**
 * The station's home, its page in the network lens, which a click on the
 * stations index opens.
 */
const NORTHGATE_HOME = `/network/stations/${encodeURIComponent(NORTHGATE_CURIE)}`;

/**
 * The line's home, its page in the network lens, which a click on the lines
 * index opens.
 */
const CIRCLE_LINE_HOME = `/network/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`;

/** The landing and every route kind of each lens, which must all hydrate
 * silently. */
const HYDRATED_PATHS = [
  "/",
  "/stations",
  "/lines",
  NORTHGATE_PATH,
  CIRCLE_LINE_PATH,
  "/definitions",
  `/definitions/${encodeURIComponent(STATION_CLASS_CURIE)}`,
] as const;

/** The window property a page sets to prove no new document loaded. */
const DOCUMENT_MARKER = "__metroDocumentMarker";

let graph: RunningServer;
let browser: Browser;
const servers = new Map<string, RunningServer>();
const pages: Page[] = [];

/**
 * Open a tab on the cell's server. A request the cell or the graph serves
 * goes through; any other is answered empty, so a third-party asset the
 * sandbox cannot reach never reaches the console. Fonts are answered empty
 * too: the suites read behaviour, not type, and the dev cell's asset bridge
 * stalls on a body streamed as large as a font, which would hold every load
 * open. Every WebSocket, which only the dev cell's live reload opens, meets
 * a silent stand-in: its port is fixed, so another Vite server on the
 * machine may hold it and answer. Every console error and uncaught page
 * error is collected.
 *
 * @returns The tab, its base URL and the errors it collects.
 * @note Impure: opens a browser tab.
 */
const openTab = async (
  script: string,
): Promise<{
  readonly page: Page;
  readonly base: string;
  readonly errors: string[];
}> => {
  const server = servers.get(script);
  if (server === undefined) {
    throw new Error(`${script} is not running`);
  }
  const page = await browser.newPage();
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
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  return { page, base: server.base, errors };
};

/**
 * Load `path` and wait until the page has settled, so the hydrated app, not
 * the bare server markup, receives what the test does next.
 *
 * @note Impure: navigates the tab.
 */
const loadPage = async (page: Page, base: string, path: string) => {
  await page.goto(new URL(path, base).href, { waitUntil: "networkidle" });
};

/**
 * Mark the current document, then follow the first link `selector` finds,
 * and wait for the destination's level-1 heading.
 *
 * @note Impure: drives the tab.
 */
const followLink = async (page: Page, selector: string, title: string) => {
  await page.evaluate((marker) => {
    Reflect.set(window, marker, true);
  }, DOCUMENT_MARKER);
  await page.locator(selector).first().click();
  await page
    .getByRole("heading", { level: 1, name: title })
    .waitFor({ timeout: CLICK_SETTLE_MS });
};

/**
 * Mark the current document, then follow the index entry linking to
 * `href`, and wait for the destination's level-1 heading.
 *
 * @note Impure: drives the tab.
 */
const followIndexEntry = (page: Page, href: string, title: string) =>
  followLink(page, `a[href="${href}"]`, title);

/** Whether the tab still shows the document `followIndexEntry` marked. */
const readDocumentMarker = (page: Page): Promise<unknown> =>
  page.evaluate((marker) => Reflect.get(window, marker), DOCUMENT_MARKER);

beforeAll(
  async () => {
    graph = await startServer("graph", CWD, {
      timeoutMs: GRAPH_READY_MS,
      portEnv: "GRAPH_PORT",
      hostname: "127.0.0.1",
    });
    for (const { script, timeoutMs } of CELLS) {
      servers.set(
        script,
        await startServer(script, CWD, {
          timeoutMs,
          env: { VITE_GRAPHQL_URL: `${graph.base}/graphql` },
        }),
      );
    }
    browser = await launchBrowser();
  },
  GRAPH_READY_MS + DEV_READY_MS + PREVIEW_READY_MS,
);

afterEach(async () => {
  for (const page of pages.splice(0)) {
    await page.close();
  }
});

afterAll(async () => {
  await browser?.close();
  for (const server of servers.values()) {
    await server.stop();
  }
  await graph?.stop();
});

describe.each(CELLS)("$script in a browser", ({ script }) => {
  it("opens a lens from its door without reloading the document", async () => {
    const { page, base } = await openTab(script);
    await loadPage(page, base, "/");
    // Scoped to the door: the rail links to the same index first in the
    // document's order.
    await followLink(page, '.ds.lens-card a[href="/stations"]', "Stations");
    expect(new URL(page.url()).pathname).toBe("/stations");
    expect(await readDocumentMarker(page)).toBe(true);
  });

  it("leads home from the rail's brand without reloading the document", async () => {
    const { page, base } = await openTab(script);
    await loadPage(page, base, "/stations");
    await followLink(page, ".ds.rail .brand", "Overview");
    expect(new URL(page.url()).pathname).toBe("/");
    expect(await readDocumentMarker(page)).toBe(true);
  });

  it("opens a station from the stations index without reloading the document", async () => {
    const { page, base } = await openTab(script);
    await loadPage(page, base, "/stations");
    await followIndexEntry(page, NORTHGATE_HOME, NORTHGATE_TITLE);
    expect(new URL(page.url()).pathname).toBe(NORTHGATE_HOME);
    expect(await readDocumentMarker(page)).toBe(true);
    await expect(
      page.getByRole("heading", { level: 2, name: "Routes" }).isVisible(),
    ).resolves.toBe(true);
  });

  it("opens a line from the lines index without reloading the document", async () => {
    const { page, base } = await openTab(script);
    await loadPage(page, base, "/lines");
    await followIndexEntry(page, CIRCLE_LINE_HOME, CIRCLE_LINE_TITLE);
    expect(new URL(page.url()).pathname).toBe(CIRCLE_LINE_HOME);
    expect(await readDocumentMarker(page)).toBe(true);
  });

  it("returns to the index on Back", async () => {
    const { page, base } = await openTab(script);
    await loadPage(page, base, "/stations");
    await followIndexEntry(page, NORTHGATE_HOME, NORTHGATE_TITLE);
    await page.goBack();
    await page
      .getByRole("heading", { level: 1, name: "Stations" })
      .waitFor({ timeout: CLICK_SETTLE_MS });
    expect(new URL(page.url()).pathname).toBe("/stations");
    expect(await readDocumentMarker(page)).toBe(true);
  });

  it("hydrates every page without a console error", async () => {
    const { page, base, errors } = await openTab(script);
    for (const path of HYDRATED_PATHS) {
      await loadPage(page, base, path);
    }
    expect(errors).toEqual([]);
  });
});
