// @vitest-environment node

/**
 * The sectioned view in the browser at 1440px, where its aside holds the
 * last three of the canvas's twelve columns: on a standard's page the
 * aside sits on `-4 / -1`, sticky, 348px wide beside an 833px content
 * column whose Rule paragraph keeps a 592px measure; on Button's page the
 * aside stays where it is while the canvas scrolls to its end.
 */

import { launchBrowser } from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEV_READY_MS, PAGE_SETTLE_MS } from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/** The desktop the view's three groups are designed for. */
const DESKTOP = { width: 1440, height: 900 } as const;

/** A standard's reading page, which has one section, the rule. */
const STANDARD_PATH = `/standards/${encodeURIComponent("http://pragma.canonical.com/codestandards#code.api.stability")}`;

/** Button's component page, whose sections run past the canvas's height. */
const BUTTON_PATH = `/components/${encodeURIComponent("ds:global.component.button")}`;

/** The aside's width at 1440: three columns and two gutters. */
const ASIDE_WIDTH_PX = 348;

/** The content's width at 1440: the nine columns before the aside. */
const CONTENT_WIDTH_PX = 833;

/** The prose measure at 1440. */
const PROSE_MEASURE_PX = 592;

/** How far a measured width or edge may round, in pixels. */
const TOLERANCE_PX = 1;

/** What the view's regions measure on a page. */
type ViewMeasure = {
  readonly asideColumn: readonly [string, string];
  readonly asidePosition: string;
  readonly asideWidth: number;
  readonly contentWidth: number;
  readonly ruleWidth: number | null;
};

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

/**
 * Open `path` at 1440 by 900, serving only the app's and the graph's
 * origins.
 *
 * @note Impure: opens a browser tab, which the caller closes.
 */
const open = async (path: string): Promise<Page> => {
  const page = await browser.newPage({ viewport: DESKTOP });
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

/**
 * Measure the view's aside, its content and the rule section's first
 * paragraph. Runs in the page.
 *
 * @throws When the page has no sectioned view or no aside.
 */
const measureView = (): ViewMeasure => {
  const view = document.querySelector(".ds.sectioned-view");
  const aside = view?.querySelector(":scope > .aside");
  const content = view?.querySelector(":scope > .content");
  if (!aside || !content) throw new Error("the page has no view with an aside");
  const style = getComputedStyle(aside);
  const rule = view?.querySelector(
    ":scope > .content > .section > .section-body p",
  );
  return {
    asideColumn: [style.gridColumnStart, style.gridColumnEnd],
    asidePosition: style.position,
    asideWidth: aside.getBoundingClientRect().width,
    contentWidth: content.getBoundingClientRect().width,
    ruleWidth: rule ? rule.getBoundingClientRect().width : null,
  };
};

describe("the sectioned view at 1440px", () => {
  it("puts a standard's aside on the last three columns, sticky, beside the content's measure", async () => {
    const page = await open(STANDARD_PATH);
    try {
      const view = await page.evaluate(measureView);
      expect(view.asideColumn).toEqual(["-4", "-1"]);
      expect(view.asidePosition).toBe("sticky");
      expect(Math.abs(view.asideWidth - ASIDE_WIDTH_PX)).toBeLessThanOrEqual(
        TOLERANCE_PX,
      );
      expect(
        Math.abs(view.contentWidth - CONTENT_WIDTH_PX),
      ).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(view.ruleWidth).not.toBeNull();
      expect(
        Math.abs((view.ruleWidth ?? 0) - PROSE_MEASURE_PX),
      ).toBeLessThanOrEqual(TOLERANCE_PX);
    } finally {
      await page.close();
    }
  });

  it("keeps Button's aside where it is while the canvas scrolls to its end", async () => {
    const page = await open(BUTTON_PATH);
    try {
      const readAsideTop = () =>
        page.evaluate(
          () =>
            document
              .querySelector(".ds.sectioned-view > .aside")
              ?.getBoundingClientRect().top ?? null,
        );
      const before = await readAsideTop();
      const scrolled = await page.evaluate(async () => {
        const canvas = document.querySelector("main.ds.canvas");
        if (!canvas) throw new Error("the page has no canvas");
        canvas.scrollTop = canvas.scrollHeight;
        await new Promise((resolve) => requestAnimationFrame(resolve));
        return canvas.scrollTop;
      });
      const after = await readAsideTop();
      expect(scrolled).toBeGreaterThan(0);
      expect(before).not.toBeNull();
      expect(Math.abs((after ?? 0) - (before ?? 0))).toBeLessThanOrEqual(
        TOLERANCE_PX,
      );
    } finally {
      await page.close();
    }
  });
});
