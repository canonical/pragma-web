// @vitest-environment node

/**
 * The metro booted with search left out (`PRISM_SEARCH=off`, W8-A2): the
 * graph serves no `search`, the site offers no `/search` route and no rail
 * entry, and the palette reads "Jump to" with no hand-off line.
 */

import { launchBrowser } from "@canonical/prism-core/testing/browser";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CLICK_SETTLE_MS,
  DEV_READY_MS,
  GRAPH_READY_MS,
  PAGE_SETTLE_MS,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

const NO_SEARCH = { PRISM_SEARCH: "off" } as const;

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;

beforeAll(
  async () => {
    graph = await startServer("graph", CWD, {
      timeoutMs: GRAPH_READY_MS,
      portEnv: "GRAPH_PORT",
      hostname: "127.0.0.1",
      env: NO_SEARCH,
    });
    server = await startServer("dev:bun", CWD, {
      timeoutMs: DEV_READY_MS,
      env: { ...NO_SEARCH, VITE_GRAPHQL_URL: `${graph.base}/graphql` },
    });
    browser = await launchBrowser();
  },
  GRAPH_READY_MS + DEV_READY_MS + PAGE_SETTLE_MS,
);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
  await graph?.stop();
});

describe("the metro without search", () => {
  it("serves no search field, no search page and no rail entry for one", async () => {
    const answer = await fetch(`${graph.base}/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: '{ search(text: "but") { total } }' }),
    });
    expect(
      ((await answer.json()) as { errors?: unknown }).errors,
    ).toBeDefined();
    expect((await fetch(`${server.base}/search?q=but`)).status).toBe(404);
    const html = await (await fetch(`${server.base}/stations`)).text();
    expect(html).not.toContain('href="/search');
  });

  it("opens the palette as Jump to, with no hand-off line", async () => {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    try {
      await page.goto(new URL("/stations", server.base).href, {
        waitUntil: "networkidle",
        timeout: PAGE_SETTLE_MS,
      });
      await page.keyboard.press("Control+k");
      const palette = page.locator("dialog.command-palette");
      await palette.waitFor({ timeout: CLICK_SETTLE_MS });
      expect(await palette.getAttribute("aria-label")).toBe("Jump to");
      await page.keyboard.type("but");
      await page.waitForLoadState("networkidle");
      expect(await palette.locator(".handoff").count()).toBe(0);
    } finally {
      await page.close();
    }
  });
});
