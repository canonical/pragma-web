/**
 * The keyboard pass over QueryInput's flows, in the built Storybook: each
 * story opens, its play runs, and the flow it shows is then driven again
 * from where the play left it, with real keys only. Each journey checks
 * where focus lands, what the chips say, and that no chip's Entry is left
 * open. A field at the bottom of the viewport opens its list above.
 *
 * Necessary evidence, not a conformance claim: it proves what a keyboard
 * reaches, not what a screen reader announces.
 */

import { expect, type Locator, type Page, test } from "playwright/test";

/** The story id of one QueryInput story. */
const buildStoryId = (name: string): string =>
  `work-in-progress-queryinput--${name}`;

/** The render phases after which a story is drawn and its play done. */
const SETTLED_PHASES: readonly string[] = ["completed", "finished"];

/**
 * Open one story alone, and wait until its play function has finished, so
 * a journey starts from the state the play leaves.
 *
 * @note Impure: navigates the page.
 */
const openStory = async (page: Page, name: string): Promise<void> => {
  await page.goto(`/iframe.html?id=${buildStoryId(name)}&viewMode=story`);
  await page.waitForFunction((phases) => {
    const preview = (
      window as {
        readonly __STORYBOOK_PREVIEW__?: {
          readonly currentRender?: { readonly phase?: string };
        };
      }
    ).__STORYBOOK_PREVIEW__;
    const phase = preview?.currentRender?.phase;
    return phase !== undefined && phases.includes(phase);
  }, SETTLED_PHASES);
};

/** The field's own entry. */
const findEntry = (page: Page): Locator =>
  page.getByRole("combobox", { name: "Filter machines" });

/** A chip's Entry, for one part of one field. */
const findPartEntry = (page: Page, part: string, field: string): Locator =>
  page.getByRole("combobox", { name: `${part} for ${field}` });

/** The chips' names, in order. */
const readChips = (page: Page): Promise<string[]> =>
  page
    .locator("#storybook-root [role=group]")
    .evaluateAll((groups) =>
      groups.map((group) => group.getAttribute("aria-label") ?? ""),
    );

/** No chip's Entry is open: the field's own entry is the only combobox. */
const expectNoEditOpen = async (page: Page): Promise<void> => {
  await expect(page.locator("#storybook-root [role=combobox]")).toHaveCount(1);
};

/**
 * The names Chromium's own accessibility tree gives the nodes with a role,
 * which lay out as jsdom cannot.
 *
 * @note Impure: opens a DevTools session on the page.
 */
const readTreeNames = async (page: Page, role: string): Promise<string[]> => {
  const session = await page.context().newCDPSession(page);
  const { nodes } = (await session.send("Accessibility.getFullAXTree")) as {
    nodes: {
      role?: { value?: string };
      name?: { value?: string };
      ignored?: boolean;
    }[];
  };
  await session.detach();
  return nodes
    .filter((node) => !node.ignored && node.role?.value === role)
    .map((node) => node.name?.value ?? "");
};

/** Choose the first option the list offers, by keys. */
const chooseFirst = async (page: Page): Promise<void> => {
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
};

test.describe("QueryInput, keyboard only", () => {
  test("BuildAChip: a field typed and its parts chosen make a chip, and focus returns to the entry", async ({
    page,
  }) => {
    await openStory(page, "build-a-chip");
    await expect(findEntry(page)).toBeFocused();
    await page.keyboard.type("pool");
    await page.keyboard.press("Enter");
    await expect(findPartEntry(page, "Operator", "pool")).toBeFocused();
    // In the draft's empty Entry, the arrows only move the caret.
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await expect(findPartEntry(page, "Operator", "pool")).toBeFocused();
    expect(await readChips(page)).toEqual(["status is deployed", "pool"]);
    await chooseFirst(page);
    await expect(findPartEntry(page, "Value", "pool")).toBeFocused();
    await chooseFirst(page);
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual([
      "status is deployed",
      "pool is default",
    ]);
    await expectNoEditOpen(page);
  });

  test("EditAChip: Enter edits the focused part, and focus returns to it", async ({
    page,
  }) => {
    await openStory(page, "edit-a-chip");
    const ready = page.getByRole("button", { name: "ready", exact: true });
    await expect(ready).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(findPartEntry(page, "Value", "status")).toBeFocused();
    await chooseFirst(page);
    await expect(
      page.getByRole("button", { name: "deployed", exact: true }),
    ).toBeFocused();
    expect(await readChips(page)).toEqual(["status is deployed"]);
    await expectNoEditOpen(page);
  });

  test("CancelAnEdit: Escape ends an edit, the chip unchanged and focus on its part", async ({
    page,
  }) => {
    await openStory(page, "cancel-an-edit");
    const deployed = page.getByRole("button", {
      name: "deployed",
      exact: true,
    });
    await expect(deployed).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(findPartEntry(page, "Value", "status")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(deployed).toBeFocused();
    expect(await readChips(page)).toEqual(["status is deployed"]);
    await expectNoEditOpen(page);
  });

  test("TabOutOfADraft: Tab writes what is typed and past the last part commits the chip; the next Tab leaves", async ({
    page,
  }) => {
    await openStory(page, "tab-out-of-a-draft");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual(["status is ready"]);
    await page.keyboard.type("owner");
    await page.keyboard.press("Enter");
    await expect(findPartEntry(page, "Operator", "owner")).toBeFocused();
    await page.keyboard.type("is");
    await page.keyboard.press("Tab");
    await expect(findPartEntry(page, "Value", "owner")).toBeFocused();
    await page.keyboard.type("bob");
    await page.keyboard.press("Tab");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual(["status is ready", "owner is bob"]);
    await expectNoEditOpen(page);
    // Shift+Tab from a draft's operator returns its field to the entry.
    await page.keyboard.type("pool");
    await page.keyboard.press("Enter");
    await expect(findPartEntry(page, "Operator", "pool")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(findEntry(page)).toBeFocused();
    await expect(findEntry(page)).toHaveValue("pool");
    expect(await readChips(page)).toEqual(["status is ready", "owner is bob"]);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    await expect(findEntry(page)).not.toBeFocused();
    await expectNoEditOpen(page);
  });

  test("RemoveAChip: after a press on a remove control, Delete removes the next chip, and focus returns to the entry", async ({
    page,
  }) => {
    await openStory(page, "remove-a-chip");
    const pool = page.getByRole("button", { name: "pool", exact: true });
    await expect(pool).toBeFocused();
    expect(await readChips(page)).toEqual(["pool is gpu"]);
    // An interactive chip's remove control stays out of the tab order:
    // Delete is its keyboard path.
    await expect(
      page.getByRole("button", { name: "Remove pool is gpu" }),
    ).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("Delete");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual([]);
  });

  test("Clear: Tab from the entry reaches the clear control, and Enter empties the field", async ({
    page,
  }) => {
    await openStory(page, "clear");
    await expect(findEntry(page)).toBeFocused();
    await page.keyboard.type("pool");
    await page.keyboard.press("Enter");
    await page.keyboard.type("is");
    await page.keyboard.press("Tab");
    await page.keyboard.type("gpu");
    await page.keyboard.press("Tab");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual(["pool is gpu"]);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Clear filters and search" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual([]);
  });

  test("HiddenChips: the unfocused field keeps its entry in reach and counts the chips it hides", async ({
    page,
  }) => {
    await openStory(page, "hidden-chips");
    const field = await page.locator("#storybook-root .field").boundingBox();
    const entry = await findEntry(page).boundingBox();
    expect(field).not.toBeNull();
    expect(entry).not.toBeNull();
    expect(entry?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(entry?.height ?? 0).toBeGreaterThanOrEqual(24);
    expect((entry?.x ?? 0) + (entry?.width ?? 0)).toBeLessThanOrEqual(
      (field?.x ?? 0) + (field?.width ?? 0),
    );
    await expect(page.locator("#storybook-root .hidden-count")).toBeVisible();
  });

  test("KeyboardOnly: build, move onto, edit and remove a chip", async ({
    page,
  }) => {
    await openStory(page, "keyboard-only");
    await expect(findEntry(page)).toBeFocused();
    await page.keyboard.type("pool");
    await chooseFirst(page);
    await chooseFirst(page);
    await chooseFirst(page);
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual(["pool is default"]);
    await page.keyboard.press("ArrowLeft");
    const pool = page.getByRole("button", { name: "pool", exact: true });
    await expect(pool).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(findPartEntry(page, "Field", "pool")).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(findPartEntry(page, "Value", "pool")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "storage", exact: true }),
    ).toBeFocused();
    expect(await readChips(page)).toEqual(["pool is storage"]);
    await page.keyboard.press("ArrowRight");
    await expect(findEntry(page)).toBeFocused();
    await page.keyboard.press("Backspace");
    await expect(pool).toBeFocused();
    await page.keyboard.press("Delete");
    await expect(findEntry(page)).toBeFocused();
    expect(await readChips(page)).toEqual([]);
    await expectNoEditOpen(page);
  });

  test("Suggestions: the highlighted option shows the inset focus ring, not only a fill", async ({
    page,
  }) => {
    await openStory(page, "suggestions");
    const highlighted = page.locator('[role="option"][aria-selected="true"]');
    await expect(highlighted).toHaveCount(1);
    const ring = await highlighted.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineOffset: style.outlineOffset,
      };
    });
    expect(ring.outlineStyle).toBe("solid");
    expect(Number.parseFloat(ring.outlineWidth)).toBeGreaterThan(0);
    expect(Number.parseFloat(ring.outlineOffset)).toBeLessThan(0);
  });

  test("WithoutScripts: the search entry is 24 px tall and shows no native cancel button", async ({
    page,
  }) => {
    await openStory(page, "without-scripts");
    const entry = page.locator("#storybook-root input[type=search]").first();
    const box = await entry.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    await entry.fill("status");
    const cancel = await entry.evaluate(
      (element) =>
        getComputedStyle(element, "::-webkit-search-cancel-button").appearance,
    );
    expect(cancel).toBe("none");
  });

  test("AtTheBottom: the list opens above an entry at the viewport's bottom", async ({
    page,
  }) => {
    await openStory(page, "at-the-bottom");
    const entry = findEntry(page);
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowDown");
    const list = page.getByRole("listbox");
    await expect(list).toBeVisible();
    const listBox = await list.boundingBox();
    const entryBox = await entry.boundingBox();
    expect(listBox).not.toBeNull();
    expect(entryBox).not.toBeNull();
    expect((listBox?.y ?? 0) + (listBox?.height ?? 0)).toBeLessThanOrEqual(
      entryBox?.y ?? 0,
    );
  });

  test("Names: the browser's tree reads an option's hint and an applied filter after one comma", async ({
    page,
  }) => {
    await openStory(page, "suggestions");
    await expect(page.getByRole("listbox")).toBeVisible();
    const options = await readTreeNames(page, "option");
    expect(options).toContain("status, 6 values");
    expect(options).toContain("at least cpu");
    await page.goto(
      "/iframe.html?id=work-in-progress-filterbutton--applied&viewMode=story",
    );
    await expect(page.getByRole("button", { name: /Status/ })).toBeVisible();
    expect(await readTreeNames(page, "button")).toContain("Status, 2 applied");
  });
});
