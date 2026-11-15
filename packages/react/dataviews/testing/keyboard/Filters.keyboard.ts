/**
 * The keyboard pass over the filters' new operators, in the built
 * Storybook, each control reached by Tab: arrow keys move through a
 * presence field's three choices and each applies as it is reached, typed
 * text narrows the rows as it is typed, focus follows text an arrow key
 * moves to another operator, and Enter on a further restriction's Clear
 * removes that one alone. One history step per input session is pinned by
 * the filters' unit tests: a story never rewrites the page's address, so
 * there is no Back to press here.
 *
 * Necessary evidence, not a conformance claim: it proves what a keyboard
 * operates, not what a screen reader announces.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, type Locator, type Page, test } from "playwright/test";

type IndexedStory = {
  readonly id: string;
  readonly title: string;
  readonly name: string;
};

/** The phases a story's render stops in, settled or failed. */
const STOPPED_PHASES: readonly string[] = [
  "completed",
  "finished",
  "aborted",
  "errored",
  "playErrored",
];

/** A filters story, from the built Storybook's index. */
const findStory = (name: string): IndexedStory => {
  const index = JSON.parse(
    readFileSync(
      resolve(import.meta.dirname, "../../storybook-static/index.json"),
      "utf8",
    ),
  ) as { readonly entries: Readonly<Record<string, IndexedStory>> };
  const story = Object.values(index.entries).find(
    (entry) =>
      entry.title === "_work_in_progress/DataViews/Filters" &&
      entry.name === name,
  );
  if (story === undefined) {
    throw new Error(`the built Storybook holds no ${name} story`);
  }
  return story;
};

/** Open a filters story by name and wait for its play to finish. */
const openStory = async (page: Page, name: string): Promise<void> => {
  await page.goto(`/iframe.html?id=${findStory(name).id}&viewMode=story`);
  const stopped = await page.waitForFunction((phases) => {
    const phase = (
      window as {
        readonly __STORYBOOK_PREVIEW__?: {
          readonly currentRender?: { readonly phase?: string };
        };
      }
    ).__STORYBOOK_PREVIEW__?.currentRender?.phase;
    return phase !== undefined && phases.includes(phase) ? phase : null;
  }, STOPPED_PHASES);
  const phase = await stopped.jsonValue();
  await stopped.dispose();
  if (phase !== "completed" && phase !== "finished") {
    throw new Error(`the ${name} story stopped: ${phase}`);
  }
};

/** The one machine the story's query keeps. */
const CACHE = { name: "cache-01.example.com" } as const;

/**
 * Press Tab from the document's start until focus lands on `target`,
 * failing if a pass of the page never reaches it: the control is reached
 * by Tab alone, as a keyboard reaches it.
 */
const tabTo = async (page: Page, target: Locator): Promise<void> => {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });
  for (let press = 0; press < 80; press += 1) {
    await page.keyboard.press("Tab");
    if (
      await target.evaluate((element) => element === document.activeElement)
    ) {
      return;
    }
  }
  throw new Error("Tab never reached the control");
};

test.describe("Filters, new operators, keyboard only", () => {
  test("Tab reaches presence's checked choice, and arrow keys apply each choice they reach", async ({
    page,
  }) => {
    await openStory(page, "New Operators");
    const owner = page.getByRole("group", { name: "Owner" });
    const any = owner.getByRole("radio", { name: "Any" });
    await tabTo(page, any);
    await expect(any).toBeChecked();
    await page.keyboard.press("ArrowDown");
    const set = owner.getByRole("radio", { name: "Has a value" });
    await expect(set).toBeFocused();
    await expect(set).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(
      owner.getByRole("radio", { name: "Has no value" }),
    ).toBeChecked();
    // Its one machine has an owner, so none is left.
    await expect(page.getByRole("cell", CACHE)).toHaveCount(0);
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(any).toBeChecked();
    await expect(page.getByRole("cell", CACHE)).toBeVisible();
  });

  test("typed text narrows the rows as it is typed", async ({ page }) => {
    await openStory(page, "New Operators");
    const host = page.getByRole("textbox", { name: "Host does not contain" });
    await tabTo(page, host);
    await page.keyboard.press("End");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("cache");
    await expect(page.getByRole("cell", CACHE)).toHaveCount(0);
    await expect(host).toBeFocused();
  });

  test("focus follows text an arrow key moves past a taken operator", async ({
    page,
  }) => {
    await openStory(page, "New Operators");
    const selects = page.getByRole("combobox", { name: "How Host matches" });
    const ending = selects.nth(1);
    await expect(ending).toHaveValue("endsWith");
    await tabTo(page, ending);
    // Up to starts with, then past does not contain, which the other
    // control holds, to contains: the text's control now comes first.
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(selects.nth(0)).toHaveValue("contains");
    await expect(selects.nth(0)).toBeFocused();
    await expect(selects.nth(1)).toHaveValue("notContains");
    await expect(page.getByRole("cell", CACHE)).toBeVisible();
  });

  test("Enter on a further restriction's Clear removes that one alone", async ({
    page,
  }) => {
    await openStory(page, "New Operators");
    const clear = page.getByRole("button", {
      name: "Clear Tags is any of ex-nvme",
    });
    await tabTo(page, clear);
    await page.keyboard.press("Enter");
    await expect(page.getByText("Tags is any of ex-nvme")).toHaveCount(0);
    await expect(
      page
        .getByRole("group", { name: "Tags is any of" })
        .getByRole("checkbox", { name: "ex-gpu" }),
    ).toBeChecked();
  });

  test("arrow keys onto Any keep focus in a presence control shown for its restriction", async ({
    page,
  }) => {
    await openStory(page, "Presence Outside The Primary Filters");
    const owner = page.getByRole("group", { name: "Owner" });
    const set = owner.getByRole("radio", { name: "Has a value" });
    await tabTo(page, set);
    await page.keyboard.press("ArrowUp");
    const any = owner.getByRole("radio", { name: "Any" });
    await expect(any).toBeChecked();
    await expect(any).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(set).toBeChecked();
    await expect(set).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(any).toBeFocused();
    // Focus leaving, the control moves under More filters, closed.
    await page.keyboard.press("Tab");
    await expect(owner).toBeHidden();
  });
});
