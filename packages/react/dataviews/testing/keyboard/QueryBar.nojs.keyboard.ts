/**
 * The query bar without scripts, in a real browser with scripting
 * disabled: the server's markup at an address, served for each address
 * the page navigates to, so the search form, the Remove and Clear links
 * and the filters' disclosure are followed as a reader would follow them.
 * The markup is rendered by the story, in a separate page with scripts.
 */

import {
  type Browser,
  expect,
  type Page,
  type TestInfo,
  test,
} from "playwright/test";

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
  story: string,
  query: string,
): Promise<{ readonly head: string; readonly body: string }> => {
  const context = await browser.newContext({
    javaScriptEnabled: true,
    baseURL: String(info.project.use.baseURL),
  });
  const page = await context.newPage();
  await page.goto(
    `/iframe.html?id=work-in-progress-dataviews-querybar--${story}&viewMode=story&query=${encodeURIComponent(query)}`,
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
const openWithoutScripts = async (
  page: Page,
  browser: Browser,
  info: TestInfo,
  story: string,
  query: string,
): Promise<void> => {
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
      story,
      url.search.replace(/^\?/, ""),
    );
    await route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html lang="en"><head><title>Machines</title>${head}</head><body><div id="storybook-root">${body}</div></body></html>`,
    });
  });
  await page.goto(`${ORIGIN}/machines?${query}`);
};

/** The address's parameters, as the page now stands. */
const readParams = (page: Page): URLSearchParams =>
  new URL(page.url()).searchParams;

/** The chips' text, in order. */
const readChips = (page: Page): Promise<string[]> =>
  page
    .locator(".ds.query-chip .body")
    .evaluateAll((bodies) =>
      bodies.map((body) =>
        (body.textContent ?? "").replace(/\s+/g, " ").trim(),
      ),
    );

test.describe("QueryBar without scripts", () => {
  // A request the page makes as a test ends finds no route to answer it.
  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("N1a: the search form keeps the filters and searches", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href",
      "status=deployed",
    );
    const search = page.getByRole("search").getByRole("searchbox");
    await expect(search).toBeVisible();
    await search.fill("db");
    await search.press("Enter");
    await expect.poll(() => readParams(page).get("q")).toBe("db");
    expect(readParams(page).get("status")).toBe("deployed");
    await expect(page.getByRole("search").getByRole("searchbox")).toHaveValue(
      "db",
    );
  });

  test("N1b: each Remove link and the Clear link lead to the query without them", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href",
      "status=deployed&memory__gte=8192&memory__lte=65536&q=web",
    );
    const remove = page.getByRole("link", {
      name: "Remove status is deployed",
    });
    await expect(remove).toBeVisible();
    await remove.click();
    await expect.poll(() => readParams(page).has("status")).toBe(false);
    expect(readParams(page).get("memory__gte")).toBe("8192");
    expect(await readChips(page)).toHaveLength(2);
    const range = page.getByRole("link", {
      name: /^Remove memory at least .+ and at most /,
    });
    await expect(range).toBeVisible();
    await range.click();
    await expect.poll(() => readParams(page).has("memory__gte")).toBe(false);
    expect(readParams(page).has("memory__lte")).toBe(false);
    const clear = page.getByRole("link", { name: "Clear filters and search" });
    await expect(clear).toBeVisible();
    await clear.click();
    await expect.poll(() => readParams(page).has("q")).toBe(false);
    expect(await readChips(page)).toEqual([]);
  });

  test("N1c: the filters' disclosure applies a filter and keeps the search", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href",
      "status=deployed&q=web",
    );
    const summary = page.getByText("Filters (1)");
    await expect(summary).toBeVisible();
    // A 24px target, as every control is.
    expect((await summary.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(
      24,
    );
    await summary.click();
    await expect(page.getByRole("checkbox", { name: "ready" })).toBeVisible();
    await page.getByRole("checkbox", { name: "ready" }).check();
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect
      .poll(() => readParams(page).getAll("status").sort())
      .toEqual(["deployed", "ready"]);
    expect(readParams(page).get("q")).toBe("web");
    expect(await readChips(page)).toContain("status:is any ofdeployed, ready");
  });

  test("N1d: Merge leads to the merged query, its bounds swapped", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href",
      "memory__gte=131072&memory__lte=65536",
    );
    const merge = page.getByRole("link", { name: "Merge the memory filters" });
    await expect(merge).toBeVisible();
    expect((await merge.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(24);
    await merge.click();
    await expect.poll(() => readParams(page).get("memory__gte")).toBe("65536");
    expect(readParams(page).get("memory__lte")).toBe("131072");
    expect(await readChips(page)).toHaveLength(1);
  });

  test("N1e: a refused filter's Clear removes it alone", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href",
      "status=melted&tags=ex-gpu",
    );
    const clear = page.getByRole("link", { name: "Clear status" });
    await expect(clear).toBeVisible();
    await clear.click();
    await expect.poll(() => readParams(page).has("status")).toBe(false);
    expect(readParams(page).get("tags")).toBe("ex-gpu");
    expect(await readChips(page)).toEqual(["tags:isex-gpu"]);
  });

  test("N3: the field, wrapped as it takes focus, pushes the message line and the disclosure down rather than covering them", async ({
    page,
    browser,
  }, info) => {
    // Wide enough to show the chips, which narrower gives way to the sheet.
    await page.setViewportSize({ width: 640, height: 720 });
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href",
      "memory__gte=131072&memory__lte=65536&status=deployed&tags=ex-gpu&q=web",
    );
    const remove = page.getByRole("link", {
      name: "Remove status is deployed",
    });
    const fieldLocator = page.locator(".ds.query-input > .field");
    const resting = (await fieldLocator.boundingBox())?.height ?? 0;
    await remove.focus();
    await expect(remove).toBeFocused();
    // The field wraps as it takes focus.
    await expect
      .poll(async () => (await fieldLocator.boundingBox())?.height ?? 0)
      .toBeGreaterThan(resting + 8);
    const field = await fieldLocator.boundingBox();
    const bottom = (field?.y ?? 0) + (field?.height ?? 0) - 1;
    const line = await page
      .locator(".ds.data-views-query-bar-message-line")
      .boundingBox();
    const summary = await page
      .locator(".ds.data-views-query-bar-filters-disclosure > .summary")
      .boundingBox();
    expect(line).not.toBeNull();
    expect(summary).not.toBeNull();
    // Both rows below it sit below the wrapped field.
    expect(line?.y ?? 0).toBeGreaterThanOrEqual(bottom);
    expect(summary?.y ?? 0).toBeGreaterThanOrEqual(bottom);
  });

  test("N2: in memory the controls show the query, inert", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(page, browser, info, "no-java-script-memory", "");
    expect(await readChips(page)).toHaveLength(2);
    await expect(page.locator(".ds.query-chip").first()).toBeVisible();
    await expect(page.locator("a[href]")).toHaveCount(0);
    await expect(page.locator("form[method]")).toHaveCount(0);
    await expect(page.locator("[name]")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Remove status is deployed" }),
    ).toBeDisabled();
  });
});
