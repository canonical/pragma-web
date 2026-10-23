import type { Browser } from "playwright";
import {
  CHROME_SELECTOR,
  CLIPPING_OVERFLOWS,
  FRAME_SELECTOR,
  OVERFLOW_TOLERANCE_PX,
  REGION_SELECTOR,
  SPACING_STEP_PX,
  THEMES,
} from "./constants.js";
import measureLayout from "./measureLayout.js";
import type { MeasurePageOptions, ThemedMeasure } from "./types.js";

/**
 * Open a page once at a viewport and measure its layout in every theme: a
 * theme only swaps the class on `<html>`, so the page is loaded once and
 * the class toggled between measurements. Only the origins named are
 * served; any other request is answered empty, and the dev server's
 * live-reload socket is left unconnected.
 *
 * @param browser - The browser to open the page in.
 * @param options - The URL, the viewport, the origins, the settle time and
 *   the elements that must fill the page's rows.
 * @returns The layout's measure in each theme, in `THEMES` order.
 * @note Impure: opens a browser tab, which it closes.
 */
export default async function measurePage(
  browser: Browser,
  { url, viewport, origins, timeoutMs, fillSelector }: MeasurePageOptions,
): Promise<readonly ThemedMeasure[]> {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  });
  try {
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
    await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
    const measures: ThemedMeasure[] = [];
    for (const theme of THEMES) {
      await page.evaluate((name) => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(name);
      }, theme);
      const measure = await page.evaluate(measureLayout, {
        chromeSelector: CHROME_SELECTOR,
        regionSelector: REGION_SELECTOR,
        frameSelector: FRAME_SELECTOR,
        fillSelector,
        step: SPACING_STEP_PX,
        tolerance: OVERFLOW_TOLERANCE_PX,
        clippingOverflows: CLIPPING_OVERFLOWS,
      });
      measures.push({ theme, measure });
    }
    return measures;
  } finally {
    await page.close();
  }
}
