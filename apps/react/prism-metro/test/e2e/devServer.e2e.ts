// @vitest-environment node

/**
 * The Bun dev cell in a real browser at a phone's width: the metro graph in
 * its own process, the dev cell pointed at it, and Chromium reading a page.
 * What is asserted is what the dev cell owes a reader besides the page: the
 * design system's icons draw, the glyph of the side panel's close button
 * among them, and the live-reload client reaches its own server.
 */
import {
  launchBrowser,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { resolveHmrPort } from "#site";
import {
  CLOSE_ICON_ID,
  CLOSE_ICON_PATH,
  DEV_READY_MS,
  GRAPH_READY_MS,
  PAGE_SETTLE_MS,
  WORKSPACE_PATH,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** The phone's viewport, where the inspector opens in a drawer. */
const PHONE = VIEWPORTS.find(({ name }) => name === "390");

/** The attribute marking the icon the test draws. */
const ICON_MARKER = "data-e2e-icon";

/** Vite's live-reload server greets a client it accepts with this frame. */
const HMR_CONNECTED_FRAME = '"type":"connected"';

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;
const pages: Page[] = [];

/**
 * Open a tab at the phone's width. A request the dev cell or the graph
 * serves goes through; any other, and every font, is answered empty, so the
 * page settles in the sandbox (the dev cell's asset bridge stalls on a body
 * as large as a font).
 *
 * @returns The tab.
 * @note Impure: opens a browser tab.
 */
const openTab = async (): Promise<Page> => {
  if (PHONE === undefined) {
    throw new Error("the browser checks name no 390px viewport");
  }
  const page = await browser.newPage({
    viewport: { width: PHONE.width, height: PHONE.height },
  });
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
  return page;
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

describe("dev:bun in a browser at 390px", () => {
  it("draws the side panel's close icon", async () => {
    const page = await openTab();
    await page.goto(new URL(WORKSPACE_PATH, server.base).href, {
      waitUntil: "networkidle",
    });
    // The markup the published `Icon` renders for the close button's
    // `icon="close"`: a `<use>` of the glyph in the served icon file.
    await page.evaluate(
      ({ path, id, marker }) => {
        const svgNs = "http://www.w3.org/2000/svg";
        const icon = document.createElementNS(svgNs, "svg");
        icon.setAttribute("class", "ds icon");
        icon.setAttribute("viewBox", "0 0 16 16");
        icon.setAttribute(marker, "");
        const use = document.createElementNS(svgNs, "use");
        use.setAttribute("href", `${path}#${id}`);
        icon.append(use);
        document.body.append(icon);
      },
      { path: CLOSE_ICON_PATH, id: CLOSE_ICON_ID, marker: ICON_MARKER },
    );
    // A `<use>` whose file never arrives, or arrives as HTML, draws nothing
    // and measures empty.
    await expect
      .poll(
        () =>
          page.evaluate((marker) => {
            const use = document.querySelector(`[${marker}] use`);
            return use instanceof SVGUseElement ? use.getBBox().width : 0;
          }, ICON_MARKER),
        { timeout: PAGE_SETTLE_MS },
      )
      .toBeGreaterThan(0);
  });

  it("connects the live-reload client to its own server", async () => {
    const page = await openTab();
    const hmrPort = String(resolveHmrPort(Number(new URL(server.base).port)));
    // Listened for before the page loads: the greeting follows the
    // handshake at once.
    let isConnected = false;
    page.on("websocket", (socket) => {
      if (new URL(socket.url()).port !== hmrPort) return;
      socket.on("framereceived", ({ payload }) => {
        if (String(payload).includes(HMR_CONNECTED_FRAME)) isConnected = true;
      });
    });
    await page.goto(new URL(WORKSPACE_PATH, server.base).href);
    await expect
      .poll(() => isConnected, { timeout: PAGE_SETTLE_MS })
      .toBe(true);
  });
});
