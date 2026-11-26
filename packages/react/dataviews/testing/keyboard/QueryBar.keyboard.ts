/**
 * The query bar's flows in a real browser, over the built Storybook's sixty
 * machines. Each journey asserts what a reader sees and where they are;
 * together they cover the suggestions laid out under the entry that has
 * focus and inside the viewport, focus after each step, the table's rows,
 * and the words the root's announcer says.
 *
 * Necessary evidence, not a conformance claim: it proves what a keyboard
 * and a pointer reach, not what a screen reader announces.
 */

import { expect, type Locator, type Page, test } from "playwright/test";
import openStory from "./openQueryBarStory.js";

/** The bar's own entry. */
const findEntry = (page: Page): Locator =>
  page.getByRole("combobox", { name: "Filter records" });

/** A chip's Entry, by its name. */
const findPart = (page: Page, name: string): Locator =>
  page.getByRole("combobox", { name, exact: true });

/** The chips' spoken names, in order. */
const readChips = (page: Page): Promise<string[]> =>
  page
    .locator("#storybook-root [role=group]")
    .evaluateAll((groups) =>
      groups.map((group) => group.getAttribute("aria-label") ?? ""),
    );

/** The table's record rows: every row but the header's. */
const countRows = async (page: Page): Promise<number> =>
  (await page.locator("#storybook-root [role=row]").count()) - 1;

/**
 * Keep every announcement the root's announcer makes, which it clears
 * after a while, for `readAnnounced` to read.
 *
 * @note Impure: observes the page's announcer.
 */
const recordAnnouncements = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const said: string[] = [];
    (window as { __said?: string[] }).__said = said;
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          const parent = node.parentElement;
          if (parent?.closest(".ds.data-views-announcer")) {
            said.push(node.textContent ?? "");
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  });

/** Everything the root's announcer has said since the recording began. */
const readAnnounced = (page: Page): Promise<string> =>
  page.evaluate(() =>
    ((window as { __said?: string[] }).__said ?? []).join("\n"),
  );

/**
 * The suggestions are open, laid out inside the viewport, and anchored to
 * the entry that has focus: just below it, or just above where there is no
 * room below.
 */
const expectListUnder = async (page: Page, entry: Locator): Promise<void> => {
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  const box = await list.boundingBox();
  const anchor = await entry.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(anchor).not.toBeNull();
  if (box === null || anchor === null || viewport === null) return;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  const isBelow = Math.abs(box.y - (anchor.y + anchor.height)) <= 12;
  const isAbove = Math.abs(box.y + box.height - anchor.y) <= 12;
  expect(isBelow || isAbove).toBe(true);
  // It starts where the entry does, give or take the field's padding.
  expect(Math.abs(box.x - anchor.x)).toBeLessThanOrEqual(48);
};

/** No chip's Entry is open: the bar's own entry is the only combobox. */
const expectNoEditOpen = async (page: Page): Promise<void> => {
  await expect(page.locator("#storybook-root [role=combobox]")).toHaveCount(1);
};

test.describe("QueryBar, in Chromium", () => {
  test("F1: a chip built by keys narrows the rows and is announced", async ({
    page,
  }) => {
    await openStory(page, "default");
    await recordAnnouncements(page);
    const before = page.url();
    await findEntry(page).click();
    await expectListUnder(page, findEntry(page));
    await page.keyboard.type("sta");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    // The draft chip appears, its Entry focused, the list following it.
    const operator = findPart(page, "Operator for status");
    await expect(operator).toBeFocused();
    expect(await readChips(page)).toEqual(["status"]);
    await expectListUnder(page, operator);
    await page.keyboard.press("Enter");
    const value = findPart(page, "Value for status");
    await expect(value).toBeFocused();
    await expectListUnder(page, value);
    await page.keyboard.type("dep");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual(["status is deployed"]);
    await expect(
      page.locator("#storybook-root .ds.query-chip").first(),
    ).toHaveText(/status\s*:\s*deployed/);
    await expect.poll(() => countRows(page)).toBe(12);
    await expect
      .poll(() => readAnnounced(page))
      .toContain("Added status is deployed. 12 records.");
    // In memory, the address does not move.
    expect(page.url()).toBe(before);
    await expectNoEditOpen(page);
  });

  test("F2: a chip built by pointer commits on a click outside", async ({
    page,
  }) => {
    await openStory(page, "default");
    await findEntry(page).click();
    await page.getByRole("option", { name: "status" }).click();
    await expect(findPart(page, "Operator for status")).toBeFocused();
    await page.getByRole("option", { name: /^is any of/ }).click();
    await expect(findPart(page, "Value for status")).toBeFocused();
    await page.getByRole("option", { name: /^ready/ }).click();
    // No jump: the Entry keeps focus for another value.
    await expect(findPart(page, "Value for status")).toBeFocused();
    await page.mouse.click(5, 5);
    await expect(page.getByRole("listbox")).toBeHidden();
    expect(await readChips(page)).toEqual(["status is ready"]);
    await expect.poll(() => countRows(page)).toBe(12);
    await expectNoEditOpen(page);
  });

  test("F3: a typed `>` reads as at least, said once, and a number in its unit", async ({
    page,
  }) => {
    await openStory(page, "default");
    await recordAnnouncements(page);
    await findEntry(page).click();
    await page.keyboard.type("memory");
    await page.keyboard.press("Enter");
    await expect(findPart(page, "Operator for memory")).toBeFocused();
    await page.keyboard.type(">");
    // Text that does not read is kept on Tab, marked, and said.
    await page.keyboard.type("lots");
    await page.keyboard.press("Tab");
    await expect(findPart(page, "Value for memory")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect
      .poll(() => readAnnounced(page))
      .toContain("Invalid: not a number");
    await findPart(page, "Value for memory").fill("");
    await page.keyboard.type("64 GiB");
    await expect(findPart(page, "Value for memory")).toHaveValue("64 GiB");
    await page.keyboard.press("Enter");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual(["memory at least 64 GiB"]);
    await expect(
      page.locator("#storybook-root .ds.query-chip").first(),
    ).toHaveText(/memory\s*≥\s*64\sGiB/);
    // Ten of the sixty hold 64 GiB and ten 128 GiB.
    await expect.poll(() => countRows(page)).toBe(20);
    await expect.poll(() => readAnnounced(page)).toContain("Read as at least");
    const said = await readAnnounced(page);
    expect(said.match(/Read as at least/g)?.length).toBe(1);
  });

  test("F4: a space in a typed value is text; on a highlighted choice it commits", async ({
    page,
  }) => {
    await openStory(page, "default");
    await findEntry(page).click();
    await page.keyboard.type("hostname");
    await page.keyboard.press("Enter");
    await page.keyboard.type("contains");
    await page.keyboard.press("Enter");
    const value = findPart(page, "Value for hostname");
    await expect(value).toBeFocused();
    await page.keyboard.type("ex node");
    await expect(value).toHaveValue("ex node");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(findEntry(page)).toBeFocused();
    await page.keyboard.type("tags");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(findPart(page, "Value for tags")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(" ");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual(["tags is ex-gpu"]);
  });

  test("F5: several values take two Enters and make one chip", async ({
    page,
  }) => {
    await openStory(page, "default");
    await recordAnnouncements(page);
    await findEntry(page).click();
    await page.keyboard.type("status");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type("dep");
    await page.keyboard.press("Enter");
    await page.keyboard.type("rea");
    await page.keyboard.press("Enter");
    await expect(findPart(page, "Value for status")).toBeFocused();
    // Each pick is said, with the clause as it now reads.
    await expect
      .poll(() => readAnnounced(page))
      .toContain("status is any of deployed, ready. Enter again to apply it.");
    await page.keyboard.press("Enter");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual(["status is any of deployed, ready"]);
    await expect.poll(() => countRows(page)).toBe(24);
  });

  test("F6: a value edited by pointer: the Entry takes the Segment's place, and Enter restores it with focus", async ({
    page,
  }) => {
    await openStory(page, "several-values");
    await page
      .getByRole("button", { name: "allocated, deployed, ready", exact: true })
      .click();
    const value = findPart(page, "Value for status");
    await expect(value).toBeFocused();
    await expect(
      page.getByRole("button", {
        name: "allocated, deployed, ready",
        exact: true,
      }),
    ).toHaveCount(0);
    await expectListUnder(page, value);
    await page.keyboard.type("bro");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    const restored = page.getByRole("button", { name: "broken", exact: true });
    await expect(restored).toBeFocused();
    await expect(restored).toHaveAttribute("tabindex", "-1");
    await expect(
      page.getByRole("button", { name: "status", exact: true }),
    ).toHaveAttribute("tabindex", "0");
    expect(await readChips(page)).toEqual(["status is broken"]);
    await expectNoEditOpen(page);
  });

  test("F7: an edit walks its parts with Tab, and past either end focus leaves in that direction", async ({
    page,
  }) => {
    await openStory(page, "several-values");
    await findEntry(page).click();
    await page.keyboard.press("ArrowLeft");
    const field = page.getByRole("button", { name: "status", exact: true });
    await expect(field).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(findPart(page, "Field")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(findPart(page, "Operator for status")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(findPart(page, "Value for status")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(findPart(page, "Operator for status")).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expectNoEditOpen(page);
    // Past the last part the chip commits, its values kept, and focus goes on.
    await expect(
      page.getByRole("button", { name: "Clear filters and search" }),
    ).toBeFocused();
    expect(await readChips(page)).toEqual([
      "status is any of allocated, deployed, ready",
    ]);
    // Before the first, focus goes back out of the bar.
    await field.click();
    await expect(findPart(page, "Field")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expectNoEditOpen(page);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document
              .querySelector(".ds.query-input")
              ?.contains(document.activeElement) ?? false,
        ),
      )
      .toBe(false);
    // The clause and the rows are as they were.
    expect(await readChips(page)).toEqual([
      "status is any of allocated, deployed, ready",
    ]);
    await expect.poll(() => countRows(page)).toBe(36);
  });

  test("F8: Escape closes the list first, then abandons the draft", async ({
    page,
  }) => {
    await openStory(page, "default");
    await findEntry(page).click();
    await page.keyboard.type("status");
    await page.keyboard.press("Enter");
    const operator = findPart(page, "Operator for status");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
    expect(await readChips(page)).toEqual(["status"]);
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(operator).toBeFocused();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual([]);
  });

  test("F9: Backspace selects the last chip, then removes it, focus on the previous", async ({
    page,
  }) => {
    await openStory(page, "same-field-and");
    await findEntry(page).click();
    const chips = await readChips(page);
    await page.keyboard.press("Backspace");
    const last = page.locator("#storybook-root .ds.query-chip").last();
    await expect(last.locator("[data-part=field]")).toBeFocused();
    await page.keyboard.press("Backspace");
    expect(await readChips(page)).toEqual(chips.slice(0, -1));
    await expect(
      page
        .locator("#storybook-root .ds.query-chip")
        .last()
        .locator("[data-part=field]"),
    ).toBeFocused();
    // With none left, focus is on the entry.
    for (const _ of chips.slice(0, -1)) await page.keyboard.press("Backspace");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual([]);
  });

  test("F10: a chip removed by pointer hands the stop to the next", async ({
    page,
  }) => {
    await openStory(page, "same-field-and");
    const chips = await readChips(page);
    const first = page.locator("#storybook-root .ds.query-chip").first();
    await first.hover();
    await first.getByRole("button", { name: /^Remove/ }).click();
    expect(await readChips(page)).toEqual(chips.slice(1));
    await expect(
      page
        .locator("#storybook-root .ds.query-chip")
        .first()
        .locator("[data-part=field]"),
    ).toBeFocused();
  });

  test("F11: the clear control clears the chips and the search, then hides", async ({
    page,
  }) => {
    await openStory(page, "same-field-and");
    await findEntry(page).click();
    await page.keyboard.type("node-1");
    await page.keyboard.press("Enter");
    expect(await readChips(page)).toContain("Search for node-1");
    await page
      .getByRole("button", { name: "Clear filters and search" })
      .click();
    expect(await readChips(page)).toEqual([]);
    await expect(findEntry(page)).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Clear filters and search" }),
    ).toHaveCount(0);
    await expect.poll(() => countRows(page)).toBe(50);
  });

  test("F11b: with the query in the address, Back after a clear brings the clauses back", async ({
    page,
  }) => {
    await openStory(page, "with-history");
    const before = await readChips(page);
    expect(before).toEqual(["status is any of deployed, ready"]);
    await expect.poll(() => countRows(page)).toBe(24);
    await page
      .getByRole("button", { name: "Clear filters and search" })
      .click();
    expect(await readChips(page)).toEqual([]);
    await expect.poll(() => countRows(page)).toBe(50);
    await page.goBack();
    await expect.poll(() => readChips(page)).toEqual(before);
    await expect.poll(() => countRows(page)).toBe(24);
  });

  test("F12: free text Enter makes one search chip and searches the rows", async ({
    page,
  }) => {
    await openStory(page, "default");
    await findEntry(page).click();
    await page.keyboard.type("node-1");
    await page.keyboard.press("Enter");
    expect(await readChips(page)).toEqual(["Search for node-1"]);
    await expect(findEntry(page)).toHaveValue("");
    // ex-node-10 to ex-node-19.
    await expect.poll(() => countRows(page)).toBe(10);
  });

  test("F13: two chips on one field both hold", async ({ page }) => {
    await openStory(page, "same-field-and");
    expect(await readChips(page)).toEqual([
      "status is any of deployed, ready",
      "tags is ex-gpu",
      "tags is ex-nvme",
    ]);
    // A machine holds both tags, and either status: four of the sixty.
    await expect.poll(() => countRows(page)).toBe(4);
  });

  test("F14: paste and composed text are never blocked", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openStory(page, "default");
    await findEntry(page).click();
    await page.evaluate(() => navigator.clipboard.writeText("stat"));
    await page.keyboard.press("ControlOrMeta+V");
    await expect(findEntry(page)).toHaveValue("stat");
    await expect(page.getByRole("option")).toHaveCount(1);
    // A composed string, as an input method commits it.
    const session = await page.context().newCDPSession(page);
    await session.send("Input.imeSetComposition", {
      text: "u",
      selectionStart: 1,
      selectionEnd: 1,
    });
    await session.send("Input.insertText", { text: "us" });
    await session.detach();
    await expect(findEntry(page)).toHaveValue("status");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.insertText("répondu");
    await expect(findPart(page, "Value for status")).toHaveValue("répondu");
  });

  test("F15: a change from outside leaves an edit's focus and text", async ({
    page,
  }) => {
    // The story's play opens an edit, types, and presses the outside control.
    await openStory(page, "outside-change");
    const value = findPart(page, "Value for status");
    await expect(value).toBeFocused();
    await expect(value).toHaveValue("rea");
    expect(await readChips(page)).toContain("tags is ex-ssd");
    // Pressed again by a real pointer, it takes no focus from the edit.
    await page
      .getByRole("button", { name: "Show only machines tagged ex-ssd" })
      .click();
    await expect(value).toBeFocused();
    await expect(value).toHaveValue("rea");
  });

  test("F16: overflowing chips hold one line and count the hidden; focus wraps them", async ({
    page,
  }) => {
    await openStory(page, "overflow");
    const field = page.locator("#storybook-root .ds.query-input .field");
    const resting = await field.boundingBox();
    await expect(page.locator("#storybook-root .hidden-count")).toBeVisible();
    await expect(page.locator("#storybook-root .hidden-count")).toHaveText(
      /^\+\d+ more$/,
    );
    // At rest, every chip shown stands on one line.
    const readTops = () =>
      page
        .locator("#storybook-root .ds.query-chip")
        .evaluateAll((chips) => [
          ...new Set(
            chips
              .filter((chip) => getComputedStyle(chip).visibility !== "hidden")
              .map((chip) => Math.round(chip.getBoundingClientRect().top)),
          ),
        ]);
    expect(await readTops()).toHaveLength(1);
    const tableTop = (
      await page.locator("#storybook-root [role=table]").boundingBox()
    )?.y;
    await findEntry(page).focus();
    await expect
      .poll(async () => (await field.boundingBox())?.height ?? 0)
      .toBeGreaterThan((resting?.height ?? 0) + 8);
    // Focused, they wrap, and overlay what follows rather than push it.
    expect((await readTops()).length).toBeGreaterThan(1);
    expect(
      (await page.locator("#storybook-root [role=table]").boundingBox())?.y,
    ).toBe(tableTop);
    const clear = page.getByRole("button", {
      name: "Clear filters and search",
    });
    expect(
      await clear.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const top = document.elementFromPoint(
          box.x + box.width / 2,
          box.y + box.height / 2,
        );
        return top !== null && element.contains(top);
      }),
    ).toBe(true);
    // Seven chips: memory's two bounds read as one range.
    expect(await readChips(page)).toHaveLength(7);
  });

  test("F17: an invalid value is marked, and the line below the field says the clause still applies", async ({
    page,
  }) => {
    await openStory(page, "invalid-input");
    const rows = await countRows(page);
    const value = findPart(page, "Value for memory");
    await expect(value).toBeFocused();
    await expect(value).toHaveAttribute("aria-invalid", "true");
    const line = page.locator(
      "#storybook-root .ds.data-views-query-bar-message-line",
    );
    await expect(line).toHaveText(
      /Invalid: .+ The previous restriction still applies\./,
    );
    await expect(line.getByRole("alert")).toHaveCount(0);
    // The field, focused, never covers it.
    const field = await page
      .locator("#storybook-root .ds.query-input .field")
      .boundingBox();
    const box = await line.boundingBox();
    expect(box?.y ?? 0).toBeGreaterThanOrEqual(
      (field?.y ?? 0) + (field?.height ?? 0) - 1,
    );
    // Another invalid value, committed here: the rows the clause narrowed
    // to stay as they were.
    expect(rows).toBeLessThan(50);
    await value.fill("8 GX");
    await page.keyboard.press("Enter");
    await expect(value).toHaveAttribute("aria-invalid", "true");
    // Left, the edit shows the clause that stood before still stands, and
    // only then are the rows read.
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("group", { name: /^memory at least 64.GiB$/ }),
    ).toBeVisible();
    expect(await countRows(page)).toBe(rows);
  });

  test("F18: clauses that cannot both hold warn, and Merge makes one range", async ({
    page,
  }) => {
    await openStory(page, "contradiction");
    await recordAnnouncements(page);
    await expect(
      page.getByText("The memory filters cannot all hold, so nothing matches."),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Merge the memory filters" })
      .click();
    expect(await readChips(page)).toEqual([
      "memory at least 64\u00a0GiB and at most 128\u00a0GiB",
    ]);
    await expect
      .poll(() => readAnnounced(page))
      .toMatch(/Merged the memory filters\. \d+ records\./);
    await expect(
      page.getByRole("button", { name: "memory", exact: true }),
    ).toBeFocused();
    await expect.poll(() => countRows(page)).toBeGreaterThan(0);
  });

  test("F18b: Merge pressed by pointer while the chips wrap still merges", async ({
    page,
  }) => {
    // Wider than the narrow form, which hides the chips; each chip is made
    // wide, so the two wrap once the field takes focus.
    await page.setViewportSize({ width: 640, height: 720 });
    await openStory(page, "contradiction");
    await page.addStyleTag({
      content: "#storybook-root .ds.query-chip { min-inline-size: 16rem; }",
    });
    const field = page.locator("#storybook-root .ds.query-input .field");
    const resting = (await field.boundingBox())?.height ?? 0;
    await findEntry(page).focus();
    // The suggestions closed, the field keeps focus.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
    // Focused, the chips wrap over more than one line.
    await expect
      .poll(async () => (await field.boundingBox())?.height ?? 0)
      .toBeGreaterThan(resting + 8);
    // A press as a hand makes it: down, a moment, then up where it began.
    const merge = await page
      .getByRole("button", { name: "Merge the memory filters" })
      .boundingBox();
    expect(merge).not.toBeNull();
    const x = (merge?.x ?? 0) + (merge?.width ?? 0) / 2;
    const y = (merge?.y ?? 0) + (merge?.height ?? 0) / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    // Two frames on, the press has been laid out: the field keeps focus and
    // its wrap, and Merge stays under the pointer.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(findEntry(page)).toBeFocused();
    await expect
      .poll(async () => (await field.boundingBox())?.height ?? 0)
      .toBeGreaterThan(resting + 8);
    const held = await page
      .getByRole("button", { name: "Merge the memory filters" })
      .boundingBox();
    expect(held).not.toBeNull();
    expect(x).toBeGreaterThanOrEqual(held?.x ?? 0);
    expect(x).toBeLessThanOrEqual((held?.x ?? 0) + (held?.width ?? 0));
    expect(y).toBeGreaterThanOrEqual(held?.y ?? 0);
    expect(y).toBeLessThanOrEqual((held?.y ?? 0) + (held?.height ?? 0));
    await page.mouse.up();
    await expect
      .poll(() => readChips(page))
      .toEqual(["memory at least 64\u00a0GiB and at most 128\u00a0GiB"]);
  });

  test("F19: a range is one chip; each bound edits in place, and removal takes both", async ({
    page,
  }) => {
    await openStory(page, "range");
    await recordAnnouncements(page);
    const rows = await countRows(page);
    // By keys alone: Left onto the chip, Enter opens its lower bound, Tab
    // moves on to the upper, and Escape leaves it as it was.
    await findEntry(page).focus();
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");
    await expect(findPart(page, "Lower bound for memory")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(findPart(page, "Upper bound for memory")).toBeFocused();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expectNoEditOpen(page);
    await page
      .getByRole("button", { name: "at most 64\u00a0GiB", exact: true })
      .click();
    const value = findPart(page, "Upper bound for memory");
    await expect(value).toBeFocused();
    await value.fill("32 GiB");
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "at most 32\u00a0GiB", exact: true }),
    ).toBeFocused();
    // Thirty machines hold 8 to 32 GiB, fewer than before.
    await expect
      .poll(() => readAnnounced(page))
      .toContain("Changed to memory at most 32\u00a0GiB. 30 records.");
    await expect.poll(() => countRows(page)).toBe(30);
    expect(rows).toBeGreaterThan(30);
    await page
      .getByRole("button", {
        name: "Remove memory at least 8\u00a0GiB and at most 32\u00a0GiB",
      })
      .click();
    expect(await readChips(page)).toEqual([]);
    // Every machine again, a page of fifty.
    await expect.poll(() => countRows(page)).toBe(50);
    await expect(findEntry(page)).toBeFocused();
    await expect
      .poll(() => readAnnounced(page))
      .toContain("Removed memory at least 8\u00a0GiB and at most 32\u00a0GiB.");
    // One Back brings both bounds back; one more, the bound edited before.
    await page.goBack();
    await expect
      .poll(() => readChips(page))
      .toEqual(["memory at least 8\u00a0GiB and at most 32\u00a0GiB"]);
    await page.goBack();
    await expect
      .poll(() => readChips(page))
      .toEqual(["memory at least 8\u00a0GiB and at most 64\u00a0GiB"]);
  });

  test("F20: a refused link shows a refused chip whose reason is described, and Clear removes it", async ({
    page,
  }) => {
    await openStory(page, "refused-link");
    const clear = page.getByRole("button", { name: "Clear status" });
    await expect(clear).toHaveAccessibleDescription(/^status: /);
    const line = page.locator(
      "#storybook-root .ds.data-views-query-bar-message-line",
    );
    // The reason shows below the field, as well as describing the chip.
    await expect(line).toContainText(/^status: /);
    await expect(
      page.locator("#storybook-root .ds.query-chip.error"),
    ).toHaveCount(1);
    await clear.click();
    await expect(clear).toBeHidden();
    expect(await readChips(page)).toEqual(["tags is ex-gpu"]);
    // Cleared, the chip and its reason are gone.
    await expect(
      page.locator("#storybook-root .ds.query-chip.error"),
    ).toHaveCount(0);
    await expect(line).toHaveCount(0);
  });

  test("F21b: a date preset typed by its label commits as it resolves", async ({
    page,
  }) => {
    await openStory(page, "presets");
    // The story's play leaves the deployed value Entry open, presets first.
    const value = findPart(page, "Value for deployed");
    await expect(value).toBeFocused();
    await page.keyboard.type("Deployed this year");
    await page.keyboard.press("Enter");
    const year = new Date().getFullYear();
    expect(await readChips(page)).toEqual([`deployed at least ${year}-01-01`]);
    await expect(value).toBeHidden();
  });

  test("F21: a field's presets come first among its values, and commit as they resolve", async ({
    page,
  }) => {
    await openStory(page, "presets");
    // The story's play leaves a draft open: Escape closes its list, then
    // drops it.
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(findEntry(page)).toBeFocused();
    await findEntry(page).click();
    await page.keyboard.type("status");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    const value = findPart(page, "Value for status");
    await expect(value).toBeFocused();
    await expectListUnder(page, value);
    await expect(page.getByRole("option").first()).toHaveText(/^Not deployed/);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    expect(await readChips(page)).toEqual(["status is none of deployed"]);
    await expect(findEntry(page)).toBeFocused();
  });
});
