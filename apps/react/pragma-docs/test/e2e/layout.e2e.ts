// @vitest-environment node

/**
 * The page grid and the scroll model, measured in a real browser: the dev
 * cell (its graph server alongside) serves a workspace page and several
 * document pages, and Chromium lays each out once at a desktop and a phone
 * width, measuring it in the light and the dark theme. What is asserted is
 * what the layout promises: one intrinsic grid, the shell, which is the one
 * query container; no page scroll, and nothing reaching past the viewport
 * or past its region, at 390px too; twelve columns at 1440px and four at
 * 390px; a workspace canvas that never scrolls; a document whose only
 * scrolling regions are its canvas and its rail; and every gap, padding and
 * margin of the chrome a multiple of 4px.
 */
import {
  launchBrowser,
  measurePage,
  type ThemedMeasure,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  DEV_READY_MS,
  DOCUMENT_PATHS,
  PAGE_SETTLE_MS,
  WORKSPACE_PATH,
} from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

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

describe.each(VIEWPORTS)("at $name px", (viewport) => {
  /**
   * Open `path` once at this viewport and measure it in every theme.
   *
   * @note Impure: opens a browser tab, which it closes.
   */
  const measure = (path: string): Promise<readonly ThemedMeasure[]> =>
    measurePage(browser, {
      url: new URL(path, server.base).href,
      viewport,
      origins: [new URL(server.base).origin, new URL(server.graphBase).origin],
      timeoutMs: PAGE_SETTLE_MS,
    });

  /** Assert what every page promises, in each theme it was measured in. */
  const expectGrid = (measures: readonly ThemedMeasure[]): void => {
    for (const { theme, measure: layout } of measures) {
      expect(layout.grids, theme).toEqual([
        {
          className: "ds shell grid intrinsic",
          containerName: "shell",
          columns: viewport.columns,
        },
      ]);
      expect(layout.page.scrollHeight, theme).toBeLessThanOrEqual(
        layout.page.innerHeight,
      );
      expect(layout.overflow, theme).toEqual([]);
      expect(layout.regionOverflow.rail, theme).toBe("auto");
      expect(
        layout.offGrid,
        `${theme} spacing histogram: ${JSON.stringify(layout.histogram)}`,
      ).toEqual([]);
    }
  };

  it("lays the workspace on the one grid with a canvas that never scrolls", async () => {
    const measures = await measure(WORKSPACE_PATH);
    expectGrid(measures);
    for (const { theme, measure: layout } of measures) {
      expect(layout.canvas.overflow, theme).toBe("hidden");
      expect(layout.canvas.scrollHeight, theme).toBe(
        layout.canvas.clientHeight,
      );
      expect(layout.scrollers, theme).not.toContain("main.ds.canvas");
      // The Definitions lens gives its workspace no inspector: no region
      // and no drawer trigger.
      expect(layout.regionOverflow.inspector, theme).toBeNull();
      expect(layout.triggerShown, theme).toBe(false);
    }
  });

  it.each(DOCUMENT_PATHS)(
    "lays the document at %s on the one grid, scrolling only its canvas and its rail",
    async (path) => {
      const measures = await measure(path);
      expectGrid(measures);
      for (const { theme, measure: layout } of measures) {
        expect(layout.canvas.overflow, theme).toBe("auto");
        for (const scroller of layout.scrollers) {
          expect(["main.ds.canvas", "div.rail"], theme).toContain(scroller);
        }
      }
    },
  );
});
