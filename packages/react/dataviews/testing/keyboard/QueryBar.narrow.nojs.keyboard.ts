/**
 * The query bar's narrow form without scripts, in a real browser with
 * scripting disabled, at a phone's 360 × 740: the summary button opens the
 * sheet through its invoker command; at an address, its Apply submits the
 * filters with the search kept and Clear all is a link; in memory, it
 * opens on inert controls with nothing to submit or follow.
 */

import { expect, type Page, test } from "playwright/test";
import openWithoutScripts from "./openWithoutScripts.js";

test.use({ viewport: { width: 360, height: 740 } });

/** The address's parameters, as the page now stands. */
const readParams = (page: Page): URLSearchParams =>
  new URL(page.url()).searchParams;

test.describe("QueryBar's narrow form without scripts", () => {
  // A request the page makes as a test ends finds no route to answer it.
  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("MN1: at an address, the summary opens the sheet; Apply keeps the search; Clear all is a link", async ({
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
    // Narrow, the disclosure gives way to the summary button.
    await expect(page.getByText("Filters (1)")).toBeHidden();
    const summary = page.getByRole("button", { name: "Filters, 1 applied" });
    await expect(summary).toBeVisible();
    await summary.click();
    const sheet = page.getByRole("dialog", { name: "Filter records" });
    await expect(sheet).toBeVisible();
    expect(await sheet.evaluate((dialog) => dialog.matches(":modal"))).toBe(
      true,
    );
    await expect(
      sheet.getByRole("link", { name: "Remove status is deployed" }),
    ).toBeVisible();
    await expect(
      sheet.getByRole("link", { name: "Clear all" }),
    ).toHaveAttribute("href", /^\?q=web/);
    await sheet.getByRole("checkbox", { name: "ready" }).check();
    await sheet.getByRole("checkbox", { name: "ex-gpu" }).check();
    await sheet.getByRole("button", { name: "Apply filters" }).click();
    await expect
      .poll(() => readParams(page).getAll("status").sort())
      .toEqual(["deployed", "ready"]);
    expect(readParams(page).get("tags")).toBe("ex-gpu");
    expect(readParams(page).get("q")).toBe("web");
    // The page that address leads to has the sheet closed, and counts the
    // filter added.
    await expect(page.getByRole("dialog")).toBeHidden();
    const applied = page.getByRole("button", { name: "Filters, 2 applied" });
    await expect(applied).toBeVisible();
    await applied.click();
    await expect(
      page.getByRole("link", {
        name: "Remove status is any of deployed, ready",
      }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Clear all" }).click();
    await expect.poll(() => readParams(page).has("status")).toBe(false);
    expect(readParams(page).has("tags")).toBe(false);
    expect(readParams(page).get("q")).toBe("web");
    await expect(
      page.getByRole("button", { name: "Filters", exact: true }),
    ).toBeVisible();
  });

  test("MN1b: the close button and Escape close the sheet with no script", async ({
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
    const summary = page.getByRole("button", { name: "Filters, 1 applied" });
    await summary.click();
    const sheet = page.getByRole("dialog", { name: "Filter records" });
    await sheet.getByRole("button", { name: "Close filters" }).click();
    await expect(sheet).toBeHidden();
    await summary.click();
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("MN2: in memory, the sheet opens on inert controls: no method, no address, no name", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(page, browser, info, "no-java-script-memory", "");
    await page.getByRole("button", { name: "Filters, 1 applied" }).click();
    const sheet = page.getByRole("dialog", { name: "Filter records" });
    await expect(sheet).toBeVisible();
    await expect(
      sheet.getByRole("button", { name: "Remove status is deployed" }),
    ).toBeDisabled();
    await expect(page.locator("form[method]")).toHaveCount(0);
    await expect(page.locator("a[href]")).toHaveCount(0);
    await expect(page.locator("[name]")).toHaveCount(0);
    await sheet.getByRole("button", { name: /^Show/ }).click();
    await expect(sheet).toBeHidden();
  });
});
