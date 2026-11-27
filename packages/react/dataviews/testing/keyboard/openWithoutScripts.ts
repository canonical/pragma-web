/**
 * The query bar's server markup served to a page with scripting disabled,
 * for the js-off journeys: the markup a story renders in a separate page
 * with scripts, with the stylesheets that page loaded, served for each
 * address the page without scripts navigates to.
 */

import type { Browser, Page, TestInfo } from "playwright/test";

/** The origin the page without scripts is served from. */
const ORIGIN = "http://nojs.test";

/** The render phases after which a story is drawn and its play done. */
const SETTLED_PHASES: readonly string[] = ["completed", "finished"];

/**
 * The bar's server markup at an address, or in memory, as its story
 * renders it in a page with scripts, with the stylesheets the story's
 * page loaded, so the page without scripts looks as a reader sees it.
 *
 * @note Impure: opens and closes a browser context.
 */
const renderMarkup = async (
  browser: Browser,
  info: TestInfo,
  id: string,
  query: string,
): Promise<{ readonly head: string; readonly body: string }> => {
  const context = await browser.newContext({
    javaScriptEnabled: true,
    baseURL: String(info.project.use.baseURL),
  });
  const page = await context.newPage();
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story&query=${encodeURIComponent(query)}`,
  );
  await page.waitForFunction((phases) => {
    const phase = (
      window as {
        readonly __STORYBOOK_PREVIEW__?: {
          readonly currentRender?: { readonly phase?: string };
        };
      }
    ).__STORYBOOK_PREVIEW__?.currentRender?.phase;
    return phase !== undefined && phases.includes(phase);
  }, SETTLED_PHASES);
  // The story's whole root, every wrapper its decorators add kept.
  const body = await page.locator("#storybook-root").innerHTML();
  // Each stylesheet, by its path, which the origin serves from Storybook:
  // the page may not load from a local address of another origin.
  const head = await page.evaluate(() =>
    [...document.querySelectorAll("link[rel=stylesheet], style")]
      .filter((sheet) => sheet.closest("#storybook-root") === null)
      .map((sheet) =>
        sheet instanceof HTMLLinkElement
          ? `<link rel="stylesheet" href="${new URL(sheet.href).pathname}">`
          : sheet.outerHTML,
      )
      .join(""),
  );
  await context.close();
  return { head, body };
};

/**
 * Serve the story's markup for every address under the origin, then open
 * one.
 *
 * @note Impure: routes and navigates the page.
 */
export default async function openWithoutScripts(
  page: Page,
  browser: Browser,
  info: TestInfo,
  id: string,
  query: string,
): Promise<void> {
  await page.route(`${ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url());
    // A stylesheet, or anything else the page loads, comes from Storybook.
    if (url.pathname !== "/machines") {
      const response = await route.fetch({
        url: new URL(url.pathname, String(info.project.use.baseURL)).href,
      });
      await route.fulfill({ response });
      return;
    }
    const { head, body } = await renderMarkup(
      browser,
      info,
      id,
      url.search.replace(/^\?/, ""),
    );
    await route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html lang="en"><head><title>Machines</title>${head}</head><body><div id="storybook-root">${body}</div></body></html>`,
    });
  });
  await page.goto(`${ORIGIN}/machines?${query}`);
}
