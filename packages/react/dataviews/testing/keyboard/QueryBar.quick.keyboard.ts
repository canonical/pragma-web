/**
 * The query bar's quick filters in a real browser, over the built
 * Storybook's sixty machines in twelve pools: words that commit and mark
 * what applies, a filter button's panel that commits each tick and stays
 * open, its search and its keys, a range typed in a unit, and the quick
 * filters and the chips showing one query.
 *
 * Necessary evidence, not a conformance claim: it proves what a keyboard
 * and a pointer reach, not what a screen reader announces.
 */

import { expect, type Locator, type Page, test } from "playwright/test";
import { QUERY_BAR_QUICK } from "./constants.js";
import openStory from "./openQueryBarStory.js";

/** The table's record rows: every row but the header's. */
const countRows = async (page: Page): Promise<number> =>
  (await page.locator("#storybook-root").getByRole("row").count()) - 1;

/** One quick filter's words, by the field's label. */
const findWords = (page: Page, label: string): Locator =>
  page.locator(".ds.filter-options").filter({
    has: page.locator(".label", { hasText: label }),
  });

/** The chips' spoken names, in order. */
const readChips = (page: Page): Promise<string[]> =>
  page
    .locator("#storybook-root .ds.query-chips [role=group]")
    .evaluateAll((chips) =>
      chips.map((chip) => chip.getAttribute("aria-label") ?? ""),
    );

/** One quick filter's trigger, by the field's label. */
const findTrigger = (page: Page, label: string): Locator =>
  page.locator("#storybook-root button.ds.filter-button").filter({
    hasText: label,
  });

/** A filter button's panel, through the trigger that controls it. */
const findPanel = async (trigger: Locator): Promise<Locator> => {
  const id = await trigger.getAttribute("aria-controls");
  return trigger.page().locator(`[id="${id}"]`);
};

test.describe("QueryBar's quick filters, in Chromium", () => {
  test("Q1: a word commits, moves the mark and rows, as one history step; All clears", async ({
    page,
  }) => {
    await openStory(page, `${QUERY_BAR_QUICK}--quick-filters`);
    const length = await page.evaluate(() => window.history.length);
    const ready = findWords(page, "status").getByRole("button", {
      name: "ready",
      exact: true,
    });
    await ready.click();
    await expect(ready).toHaveAttribute("aria-current", "true");
    await expect(
      findWords(page, "status").getByRole("button", {
        name: "All",
        exact: true,
      }),
    ).not.toHaveAttribute("aria-current");
    await expect.poll(() => countRows(page)).toBe(12);
    // Said as a commit in the bar is, with the count.
    await expect(
      page.locator(".ds.data-views-announcer", {
        hasText: "Added status is ready. 12 records.",
      }),
    ).toHaveCount(1);
    expect(new URL(page.url()).searchParams.getAll("status")).toEqual([
      "ready",
    ]);
    expect(await page.evaluate(() => window.history.length)).toBe(length + 1);
    await findWords(page, "status")
      .getByRole("button", { name: "All", exact: true })
      .click();
    await expect.poll(() => countRows(page)).toBe(50);
    expect(new URL(page.url()).searchParams.has("status")).toBe(false);
  });

  test("Q2: two words of a list are both current, and one any-of chip", async ({
    page,
  }) => {
    await openStory(page, `${QUERY_BAR_QUICK}--quick-filters`);
    const tags = findWords(page, "tags");
    await tags.getByRole("button", { name: "ex-gpu", exact: true }).click();
    await tags.getByRole("button", { name: "ex-ssd", exact: true }).click();
    await expect(
      tags.getByRole("button", { name: "ex-gpu", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      tags.getByRole("button", { name: "ex-ssd", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(() => readChips(page))
      .toContain("tags is any of ex-gpu, ex-ssd");
  });

  test("Q3: each tick commits and the panel stays open; Escape and a click outside close it; leaving focus does not", async ({
    page,
  }) => {
    await openStory(page, `${QUERY_BAR_QUICK}--quick-filters`);
    const trigger = findTrigger(page, "pool");
    await trigger.click();
    const panel = await findPanel(trigger);
    await expect(panel).toBeVisible();
    await panel.getByRole("checkbox", { name: /^ex-pool-01/ }).check();
    await expect(trigger).toHaveAccessibleName("pool, 1 applied");
    await expect.poll(() => countRows(page)).toBe(5);
    await expect(panel).toBeVisible();
    await panel.getByRole("checkbox", { name: /^ex-pool-02/ }).check();
    await expect(trigger).toHaveAccessibleName("pool, 2 applied");
    await expect(trigger.locator(".ds.badge")).toHaveText("2");
    await expect.poll(() => countRows(page)).toBe(10);
    await expect(panel).toBeVisible();
    // Escape closes it and gives focus back to the trigger.
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    // Focus leaving the panel leaves it open.
    await trigger.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Shift+Tab");
    await expect(panel).toBeVisible();
    // A click outside closes it.
    await page.locator("#storybook-root").getByRole("row").nth(3).click();
    await expect(panel).toBeHidden();
  });

  test("Q4: past ten options a search narrows them; Up, Down and Space work in the list", async ({
    page,
  }) => {
    await openStory(page, `${QUERY_BAR_QUICK}--quick-filters`);
    const trigger = findTrigger(page, "pool");
    await trigger.click();
    const panel = await findPanel(trigger);
    const search = panel.getByRole("searchbox", {
      name: "Search pool options",
    });
    await expect(search).toBeFocused();
    await page.keyboard.type("ex-pool-1");
    await expect(panel.getByRole("checkbox")).toHaveCount(3);
    await page.keyboard.press("ArrowDown");
    const tenth = panel.getByRole("checkbox", { name: /^ex-pool-10/ });
    await expect(tenth).toBeFocused();
    await page.keyboard.press("Space");
    await expect(tenth).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(
      panel.getByRole("checkbox", { name: /^ex-pool-11/ }),
    ).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(search).toBeFocused();
    await expect(panel).toBeVisible();
  });

  test("Q5: a range typed in a unit commits a bound; an invalid value keeps it, with a message", async ({
    page,
  }) => {
    await openStory(page, `${QUERY_BAR_QUICK}--quick-filters`);
    const trigger = findTrigger(page, "memory");
    await trigger.click();
    const panel = await findPanel(trigger);
    const from = panel.getByRole("textbox", { name: "memory from" });
    await expect(from).toBeFocused();
    await page.keyboard.type("64 GiB");
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAccessibleName("memory, 1 applied");
    expect(new URL(page.url()).searchParams.get("memory__gte")).toBe("65536");
    // Two of the six memory sizes reach 64 GiB.
    await expect.poll(() => countRows(page)).toBe(20);
    await from.fill("lots");
    await page.keyboard.press("Enter");
    await expect(
      page.locator(".ds.data-views-announcer", { hasText: "Invalid:" }),
    ).toHaveCount(1);
    await expect(from).toHaveAttribute("aria-invalid", "true");
    await expect(panel.locator(".error")).toContainText(
      "The previous restriction still applies.",
    );
    await expect
      .poll(() => new URL(page.url()).searchParams.get("memory__gte"))
      .toBe("65536");
    await expect.poll(() => countRows(page)).toBe(20);
    await expect(panel).toBeVisible();
  });

  test("Q6: a chip added in the bar marks the quick filter; removing it clears the mark", async ({
    page,
  }) => {
    await openStory(page, `${QUERY_BAR_QUICK}--quick-filters`);
    const entry = page.getByRole("combobox", { name: "Filter records" });
    await entry.click();
    await page.keyboard.type("status");
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("combobox", { name: "Operator for status", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.type("broken");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(entry).toBeFocused();
    const broken = findWords(page, "status").getByRole("button", {
      name: "broken",
      exact: true,
    });
    await expect(broken).toHaveAttribute("aria-current", "true");
    await expect.poll(() => readChips(page)).toContain("status is broken");
    // Backspace selects the last chip, then removes it.
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await expect.poll(() => readChips(page)).not.toContain("status is broken");
    await expect(broken).not.toHaveAttribute("aria-current");
  });

  test("Q7: an excluding clause shows its mark, hidden, and says none of 2", async ({
    page,
  }) => {
    await openStory(page, `${QUERY_BAR_QUICK}--exclusion`);
    const trigger = page.getByRole("button", {
      name: "status, none of 2",
      exact: true,
    });
    await expect(trigger).toBeVisible();
    const mark = trigger.locator('.mark[data-condition="exclusion"]');
    await expect(mark).toBeVisible();
    await expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  test("Q8: narrow, the quick filters stay, and the sheet hides an open panel first", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await openStory(page, `${QUERY_BAR_QUICK}--quick-filters`);
    const trigger = findTrigger(page, "pool");
    await expect(trigger).toBeVisible();
    await trigger.click();
    const panel = await findPanel(trigger);
    await expect(panel).toBeVisible();
    // By keys, so no click outside closes the panel on its own.
    const summary = page.getByRole("button", { name: "Filters", exact: true });
    await summary.focus();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("dialog", { name: "Filter records" }),
    ).toBeVisible();
    await expect(panel).toBeHidden();
  });
});
