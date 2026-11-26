/**
 * The query bar's narrow form in a real browser, at a phone's 360 × 740:
 * the summary button, the sheet as a modal dialog, "Add filter" walked by
 * keys, removal, Clear all and the button that closes the sheet. Each
 * journey asserts where focus is, what the sheet's region says and what
 * the rows behind it show; axe checks the sheet open and each step of the
 * walk, and every control in the sheet's own parts is measured as a
 * target.
 *
 * Necessary evidence, not a conformance claim: it proves what a keyboard
 * and a pointer reach, not what a screen reader announces.
 */

import { createRequire } from "node:module";
import { expect, type Locator, type Page, test } from "playwright/test";
import openStory from "./openQueryBarStory.js";

/** axe's browser build, injected into the page. */
const AXE_PATH = createRequire(import.meta.url).resolve("axe-core/axe.min.js");

/** A phone's viewport. */
const PHONE = { width: 360, height: 740 } as const;

test.use({ viewport: PHONE });

/** The bar's own entry. */
const findEntry = (page: Page): Locator =>
  page.getByRole("combobox", { name: /^(Filter|Search) records$/ });

/** The summary button, by the count its name carries. */
const findSummary = (page: Page, applied: number): Locator =>
  page.getByRole("button", { name: `Filters, ${applied} applied` });

/** The sheet's dialog. */
const findSheet = (page: Page): Locator =>
  page.getByRole("dialog", { name: "Filter records" });

/** The table's record rows: every row but the header's. */
const countRows = async (page: Page): Promise<number> =>
  (await page.locator("#storybook-root").getByRole("row").count()) - 1;

/**
 * Keep every announcement the sheet's region makes, which it replaces as
 * it speaks again, for `readAnnounced` to read.
 *
 * @note Impure: observes the page.
 */
const recordAnnouncements = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const said: string[] = [];
    (window as { __said?: string[] }).__said = said;
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.parentElement?.closest("dialog .ds.data-views-announcer")) {
            said.push(node.textContent ?? "");
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  });

/** Everything the sheet's region has said since the recording began. */
const readAnnounced = (page: Page): Promise<string> =>
  page.evaluate(() =>
    ((window as { __said?: string[] }).__said ?? []).join("\n"),
  );

/** Everything the page's own region, behind the sheet, has said. */
const readPageRegion = (page: Page): Promise<string> =>
  page.locator(".ds.data-views-announcer").evaluateAll((regions) =>
    regions
      .filter((region) => region.closest("dialog") === null)
      .map((region) => region.textContent ?? "")
      .join(""),
  );

/**
 * axe finds no violation in the sheet: the WCAG 2.x A and AA rules, laid
 * out in a real browser.
 *
 * @note Impure: injects axe into the page.
 */
const expectSheetAccessible = async (page: Page): Promise<void> => {
  await page.addScriptTag({ path: AXE_PATH });
  const violations = await page.evaluate(async () => {
    const { axe } = window as unknown as {
      readonly axe: {
        run: (
          context: Element,
          options: object,
        ) => Promise<{
          readonly violations: readonly {
            readonly id: string;
            readonly nodes: readonly { readonly target: readonly string[] }[];
          }[];
        }>;
      };
    };
    const dialog = document.querySelector("dialog[open]");
    if (dialog === null) return [{ rule: "no open sheet", targets: [] }];
    const results = await axe.run(dialog, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
    });
    return results.violations.map((violation) => ({
      rule: violation.id,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    }));
  });
  expect(violations).toEqual([]);
};

/** Open the sheet from the summary button, and wait for it to settle. */
const openSheet = async (page: Page, applied: number): Promise<Locator> => {
  await findSummary(page, applied).click();
  const sheet = findSheet(page);
  await expect(sheet).toBeVisible();
  return sheet;
};

/** The sheet's chips' remove controls' names, in order. */
const readRemoveNames = (sheet: Locator): Promise<string[]> =>
  sheet
    .locator(".chips .remove")
    .evaluateAll((removes) =>
      removes.map((remove) => remove.getAttribute("aria-label") ?? ""),
    );

test.describe("QueryBar's narrow form, in Chromium", () => {
  test("M1: narrow, the chips give way to the summary and a search-only entry; wide, they return", async ({
    page,
  }) => {
    // A story whose bar takes the frame's width, which the viewport sets.
    await openStory(page, "range");
    await expect(page.locator("#storybook-root .ds.query-chips")).toBeHidden();
    await expect(findSummary(page, 1)).toBeVisible();
    // Search-only, the entry is named and prompted for searching.
    await expect(
      page.getByRole("combobox", { name: "Search records" }),
    ).toHaveAttribute("placeholder", "Search");
    await findEntry(page).focus();
    await page.keyboard.type("st");
    await expect(findEntry(page)).toHaveAttribute("aria-expanded", "false");
    await expect(findEntry(page)).not.toHaveAttribute("aria-controls");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    // A search committed while narrow stays in the entry.
    await findEntry(page).fill("ex-node");
    await page.keyboard.press("Enter");
    await expect.poll(() => countRows(page)).toBeGreaterThan(0);
    await expect(findEntry(page)).toHaveValue("ex-node");
    // Wide, the chips return, the search's among them, and the summary goes.
    await page.setViewportSize({ width: 1024, height: 740 });
    await expect(
      page.locator("#storybook-root .ds.query-chips").first(),
    ).toBeVisible();
    await expect(
      page.getByRole("group", { name: "Search for ex-node" }),
    ).toBeVisible();
    await expect(findEntry(page)).toHaveValue("");
    await expect(findSummary(page, 1)).toBeHidden();
    // Focus in a chip moves to the entry as the bar narrows, which shows
    // the search again.
    const field = page.getByRole("button", { name: "memory", exact: true });
    await field.focus();
    await expect(field).toBeFocused();
    await page.setViewportSize(PHONE);
    await expect(findEntry(page)).toBeFocused();
    await expect(findEntry(page)).toHaveValue("ex-node");
    await expect(findSummary(page, 1)).toBeVisible();
  });

  test("M1d: a bar just narrower than the threshold keeps its sheet open as the page stops scrolling", async ({
    page,
  }) => {
    // The bar about 595px wide: the story's frame pads it 16px a side.
    await page.setViewportSize({ width: 627, height: 740 });
    await openStory(page, "range");
    const bar = await page
      .locator("#storybook-root .ds.data-views-query-bar")
      .boundingBox();
    expect(bar?.width ?? 0).toBeLessThan(600);
    expect(bar?.width ?? 0).toBeGreaterThan(560);
    const sheet = await openSheet(page, 1);
    // Two frames on, the bar has heard of any width the lock changed.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(sheet).toBeVisible();
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollbarGutter,
      ),
    ).toBe("stable");
  });

  test("M1b: widening with the sheet open closes it, focus on the entry", async ({
    page,
  }) => {
    await openStory(page, "range");
    const sheet = await openSheet(page, 1);
    await page.setViewportSize({ width: 1024, height: 740 });
    await expect(sheet).toBeHidden();
    await expect(findEntry(page)).toBeFocused();
  });

  test("M1c: widening after the sheet closes moves focus from the summary to the entry", async ({
    page,
  }) => {
    await openStory(page, "range");
    const sheet = await openSheet(page, 1);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(findSummary(page, 1)).toBeFocused();
    await page.setViewportSize({ width: 1024, height: 740 });
    await expect(findEntry(page)).toBeFocused();
  });

  test("M2: the summary opens the sheet modally; Escape closes it, focus back on the summary, no history entry", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    const history = await page.evaluate(() => window.history.length);
    const sheet = await openSheet(page, 2);
    expect(await sheet.evaluate((dialog) => dialog.matches(":modal"))).toBe(
      true,
    );
    // The sheet fills the viewport.
    const box = await sheet.boundingBox();
    expect(box?.width).toBe(PHONE.width);
    expect(box?.height).toBe(PHONE.height);
    // Focus is inside it, and Tab keeps it there.
    for (let step = 0; step < 6; step += 1) {
      expect(
        await page.evaluate(
          () =>
            document.activeElement?.closest("dialog") !== null ||
            document.activeElement === document.body,
        ),
      ).toBe(true);
      await page.keyboard.press("Tab");
    }
    await expectSheetAccessible(page);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(findSummary(page, 2)).toBeFocused();
    expect(await page.evaluate(() => window.history.length)).toBe(history);
  });

  test("M3: Add filter by keys: the chip applies, focus on its remove control, the region says it, the rows update", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    const before = await countRows(page);
    const sheet = await openSheet(page, 2);
    await recordAnnouncements(page);
    await sheet.getByRole("button", { name: "Add filter" }).focus();
    await page.keyboard.press("Enter");
    const fields = sheet.getByRole("listbox", { name: "Choose a field" });
    await expect(fields).toBeVisible();
    await expect(sheet.getByRole("option", { name: "status" })).toBeFocused();
    await expectSheetAccessible(page);
    // status, memory, tags.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(sheet.getByRole("option", { name: "tags" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      sheet.getByRole("listbox", { name: "Choose an operator for tags" }),
    ).toBeVisible();
    await expect(
      sheet.getByRole("option", { name: /^is any of/ }),
    ).toBeFocused();
    await expectSheetAccessible(page);
    await page.keyboard.press("Enter");
    await expect(
      sheet.getByRole("listbox", { name: "Choose a value for tags" }),
    ).toBeVisible();
    await expect(sheet.getByRole("option", { name: /^ex-gpu/ })).toBeFocused();
    await expectSheetAccessible(page);
    await page.keyboard.press("Space");
    await expect(
      sheet.getByRole("option", { name: /^ex-gpu/ }),
    ).toHaveAttribute("aria-selected", "true");
    await sheet.getByRole("button", { name: "Add", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(
      sheet.getByRole("button", { name: "Remove tags is ex-gpu" }),
    ).toBeFocused();
    await expect
      .poll(() => readAnnounced(page))
      .toMatch(/Added tags is ex-gpu\. \d+ records?\./);
    await expect.poll(() => countRows(page)).not.toBe(before);
    // The page's own region, inert behind the sheet, said nothing of it.
    expect(await readPageRegion(page)).not.toContain("Added tags");
    await expect(sheet).toBeVisible();
    // A change in the filters form says the results it brings.
    await sheet.getByRole("checkbox", { name: /^ready/ }).check();
    await expect
      .poll(() => readAnnounced(page))
      .toMatch(/Updated the results\. \d+ records?\./);
  });

  test("M4: Space toggles two values, and Add makes one chip", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    const sheet = await openSheet(page, 2);
    await sheet.getByRole("button", { name: "Add filter" }).click();
    await sheet.getByRole("option", { name: "tags" }).click();
    await sheet.getByRole("option", { name: /^is any of/ }).click();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(
      sheet.locator('[role=option][aria-selected="true"]'),
    ).toHaveCount(2);
    await sheet.getByRole("button", { name: "Add", exact: true }).click();
    await expect(
      sheet.getByRole("button", {
        name: "Remove tags is any of ex-gpu, ex-ssd",
      }),
    ).toBeFocused();
    await expect(findSummary(page, 3)).toBeAttached();
  });

  test("M5: a number with a unit; invalid text is marked, a valid Enter applies", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    const sheet = await openSheet(page, 2);
    await sheet.getByRole("button", { name: "Add filter" }).click();
    await sheet.getByRole("option", { name: "memory" }).click();
    await sheet.getByRole("option", { name: /^at most/ }).click();
    const input = sheet.getByRole("textbox", { name: "Value for memory" });
    await expect(input).toBeFocused();
    await expectSheetAccessible(page);
    await page.keyboard.type("lots");
    await page.keyboard.press("Enter");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(sheet.locator(".invalid")).toBeVisible();
    await expectSheetAccessible(page);
    await input.fill("32 GiB");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await page.keyboard.press("Enter");
    await expect(
      sheet.getByRole("button", { name: /^Remove memory at most 32/ }),
    ).toBeFocused();
  });

  test("M6: Escape inside the walk leaves the walk, the sheet open, focus on Add filter", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    const sheet = await openSheet(page, 2);
    await sheet.getByRole("button", { name: "Add filter" }).click();
    await page.keyboard.press("Enter");
    await expect(
      sheet.getByRole("listbox", { name: "Choose an operator for status" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("listbox")).toHaveCount(0);
    await expect(
      sheet.getByRole("button", { name: "Add filter" }),
    ).toBeFocused();
    // Back from the first step leaves too.
    await page.keyboard.press("Enter");
    await sheet.getByRole("button", { name: "Back" }).click();
    await expect(
      sheet.getByRole("button", { name: "Add filter" }),
    ).toBeFocused();
    // Outside the walk, Escape closes the sheet.
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("M7: removing moves focus to the next remove control, else the previous, else the first filters control", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    await findEntry(page).fill("ex-node");
    await findEntry(page).press("Enter");
    const sheet = await openSheet(page, 2);
    const names = await readRemoveNames(sheet);
    expect(names).toHaveLength(3);
    // The first: the next takes focus.
    await sheet.getByRole("button", { name: names.at(0) ?? "" }).click();
    await expect(
      sheet.getByRole("button", { name: names.at(1) ?? "" }),
    ).toBeFocused();
    // The last: the previous takes focus.
    await sheet.getByRole("button", { name: names.at(2) ?? "" }).click();
    await expect(
      sheet.getByRole("button", { name: names.at(1) ?? "" }),
    ).toBeFocused();
    // The only one: the first filters control takes focus.
    await page.keyboard.press("Enter");
    await expect(sheet.locator(".chips")).toHaveCount(0);
    await expect(
      sheet.locator(".filters input:not([type=hidden])").first(),
    ).toBeFocused();
  });

  test("M8: Clear all clears the filters and keeps the search, focus on the first filters control", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    await findEntry(page).fill("ex-node");
    await findEntry(page).press("Enter");
    const sheet = await openSheet(page, 2);
    await recordAnnouncements(page);
    await sheet.getByRole("button", { name: "Clear all" }).click();
    await expect(sheet.locator(".chips .remove")).toHaveCount(1);
    await expect(
      sheet.getByRole("button", { name: "Remove Search for ex-node" }),
    ).toBeVisible();
    await expect(
      sheet.locator(".filters input:not([type=hidden])").first(),
    ).toBeFocused();
    await expect
      .poll(() => readAnnounced(page))
      .toMatch(/Cleared the filters\./);
    await page.keyboard.press("Escape");
    // None applies now: the summary reads Filters alone.
    const summary = page.locator("#storybook-root .summary");
    await expect(summary).toHaveAccessibleName("Filters");
    await expect(summary).toBeFocused();
  });

  test("M9: Show N results follows the live count, closes the sheet and commits nothing", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    const sheet = await openSheet(page, 2);
    const rows = await countRows(page);
    const results = sheet.getByRole("button", { name: /^Show \d+ results?$/ });
    await expect(results).toBeVisible();
    const first = await results.textContent();
    await sheet
      .getByRole("button", { name: /^Remove status is deployed/ })
      .click();
    await expect(results).not.toHaveText(first ?? "");
    const shown = Number(/\d+/.exec((await results.textContent()) ?? "")?.[0]);
    const chips = await readRemoveNames(sheet);
    await results.click();
    await expect(sheet).toBeHidden();
    await expect(findSummary(page, 1)).toBeFocused();
    expect(shown).toBeGreaterThan(rows);
    // The count is the rows behind, up to a page of 50.
    await expect.poll(() => countRows(page)).toBe(Math.min(shown, 50));
    // Closing wrote nothing: the sheet opens on the same chips.
    await openSheet(page, 1);
    expect(await readRemoveNames(findSheet(page))).toEqual(chips);
  });

  test("M10: with rows selected, the action bar stands above the narrow bar, the page no wider than the phone", async ({
    page,
  }) => {
    await openStory(page, "mobile-rows-selected");
    await expect(page.getByText("2 selected")).toBeVisible();
    await expect(findSummary(page, 2)).toBeVisible();
    // The action bar stands above the narrow bar.
    const action = await page.getByText("2 selected").boundingBox();
    const bar = await findSummary(page, 2).boundingBox();
    expect(action).not.toBeNull();
    expect(bar).not.toBeNull();
    expect((action?.y ?? 0) + (action?.height ?? 0)).toBeLessThanOrEqual(
      bar?.y ?? 0,
    );
    const scroll = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(scroll[0]).toBeLessThanOrEqual(scroll[1] ?? 0);
  });

  test("targets: every control in the sheet's own parts is at least 24 × 24", async ({
    page,
  }) => {
    await openStory(page, "mobile");
    const sheet = await openSheet(page, 2);
    await sheet.getByRole("button", { name: "Add filter" }).click();
    await sheet.getByRole("option", { name: "tags" }).click();
    await sheet.getByRole("option", { name: /^is any of/ }).click();
    const controls = sheet.locator(
      ":is(.header, .chips, .ds.data-views-query-bar-add-filter-walk, .footer) :is(button, a[href], input, [role=option])",
    );
    const count = await controls.count();
    expect(count).toBeGreaterThan(8);
    for (let at = 0; at < count; at += 1) {
      const box = await controls.nth(at).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    }
    expect(
      (await findSummary(page, 2).boundingBox())?.height ?? 0,
    ).toBeGreaterThanOrEqual(24);
    // The filters form's boxes and radios, which the sheet sizes for touch.
    const boxes = sheet.locator(
      ".filters input:is([type=checkbox], [type=radio])",
    );
    const boxCount = await boxes.count();
    expect(boxCount).toBeGreaterThan(4);
    for (let at = 0; at < boxCount; at += 1) {
      const box = await boxes.nth(at).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    }
  });
});
