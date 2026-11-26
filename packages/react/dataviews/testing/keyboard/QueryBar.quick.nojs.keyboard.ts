/**
 * The query bar's quick filters without scripts, in a real browser with
 * scripting disabled: the server's markup at an address, served for each
 * address the page navigates to, so a word is followed and a panel's form
 * applied as a reader would; and in memory, where nothing leads anywhere.
 * The markup is rendered by the story, in a separate page with scripts.
 */

import { expect, type Page, test } from "playwright/test";
import openWithoutScripts from "./openWithoutScripts.js";

/** The address's parameters, as the page now stands. */
const readParams = (page: Page): URLSearchParams =>
  new URL(page.url()).searchParams;

test.describe("QueryBar's quick filters without scripts", () => {
  // A request the page makes as a test ends finds no route to answer it.
  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });

  test("QN1a: a word is a link, and following it applies its value", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href-quick-filters",
      "status=deployed&memory__gte=8192&q=web",
    );
    const words = page.locator(".ds.filter-options");
    await expect(
      words.getByRole("link", { name: "deployed", exact: true }),
    ).toHaveAttribute("aria-current", "true");
    await words.getByRole("link", { name: "ready", exact: true }).click();
    await expect(
      page
        .locator(".ds.filter-options")
        .getByRole("link", { name: "ready", exact: true }),
    ).toHaveAttribute("aria-current", "true");
    const params = readParams(page);
    expect(params.getAll("status")).toEqual(["ready"]);
    expect(params.get("memory__gte")).toBe("8192");
    expect(params.get("q")).toBe("web");
    // Each word is at least a 24px target.
    const box = await page
      .locator(".ds.filter-options")
      .getByRole("link", { name: "All", exact: true })
      .boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  });

  test("QN1b: a panel's form applies its field and keeps q and the other clauses", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href-quick-filters",
      "status=deployed&memory__gte=8192&q=web",
    );
    const trigger = page.locator(".ds.filter-button", { hasText: "tags" });
    await trigger.click();
    const panel = page.locator(".ds.filter-button-panel:popover-open");
    await expect(panel).toBeVisible();
    await panel.getByRole("checkbox", { name: /^ex-gpu/ }).check();
    await panel.getByRole("button", { name: "Apply" }).click();
    // Only the page Apply leads to counts the tag it applied.
    await expect(
      page.locator(".ds.filter-button", { hasText: "tags" }),
    ).toHaveAccessibleName("tags, 1 applied");
    await expect(page).toHaveURL(/tags=ex-gpu/);
    const params = readParams(page);
    expect(params.getAll("tags")).toEqual(["ex-gpu"]);
    expect(params.getAll("status")).toEqual(["deployed"]);
    expect(params.get("memory__gte")).toBe("8192");
    expect(params.get("q")).toBe("web");
  });

  test("QN1c: in a presence panel, a radio an arrow key checks keeps its place in the Tab order", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-href-quick-filters",
      "status=deployed&q=web",
    );
    const trigger = page.locator(".ds.filter-button", { hasText: "owner" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const panel = page.locator(".ds.filter-button-panel:popover-open");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(panel.getByRole("radio", { name: "Any" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    const set = panel.getByRole("radio", { name: "Has a value" });
    await expect(set).toBeChecked();
    await page.keyboard.press("Tab");
    await expect(set).not.toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(set).toBeFocused();
  });

  test("QN2: in memory the words are text, the current one marked; the popover opens, its controls unnamed", async ({
    page,
    browser,
  }, info) => {
    await openWithoutScripts(
      page,
      browser,
      info,
      "no-java-script-memory-quick-filters",
      "",
    );
    const words = page.locator(".ds.filter-options");
    await expect(words.locator("a, button")).toHaveCount(0);
    await expect(words.locator('[aria-current="true"]')).toHaveText("deployed");
    await page.locator(".ds.filter-button", { hasText: "tags" }).click();
    const panel = page.locator(".ds.filter-button-panel:popover-open");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("checkbox")).toHaveCount(3);
    await expect(page.locator("[name]")).toHaveCount(0);
    await expect(page.locator("form")).toHaveCount(0);
  });
});
