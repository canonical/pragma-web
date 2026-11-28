import { describe, expect, it, vi } from "vitest";
import { page as browserPage, userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import MultipleSelection from "../../../../testing/MultipleSelection.fixtures.svelte";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

type State = { activeIndex: number; selected: string[] };

const setUp = async (
  props: Partial<{
    items: typeof fruits;
    isKeyActionPrevented: () => boolean;
  }> = {},
) => {
  const onSelectedItemsChange = vi.fn();
  const page = await render(MultipleSelection, {
    items: fruits,
    onSelectedItemsChange,
    ...props,
  });
  const dropdown = browserPage
    .getByRole("textbox", { name: "Dropdown" })
    .element() as HTMLInputElement;
  dropdown.focus();
  return {
    page,
    dropdown,
    onSelectedItemsChange,
    state: (): State =>
      JSON.parse(page.getByTestId("state").element().textContent ?? "{}"),
    chip: (label: string) =>
      browserPage
        .getByRole("button", { name: label })
        .element() as HTMLButtonElement,
  };
};

/**
 * The keyboard behaviour of the chips, after downshift's
 * `useMultipleSelection` reducer. Each row starts with Apple, Banana and
 * Cherry selected and focus in the empty dropdown, presses `keys` and expects
 * the resulting state and the focused chip (or the dropdown).
 */
const behaviour: {
  name: string;
  keys: string;
  expected: State;
  focused: string;
}[] = [
  {
    name: "ArrowLeft in the dropdown moves to the last chip",
    keys: "{ArrowLeft}",
    expected: { activeIndex: 2, selected: ["apple", "banana", "cherry"] },
    focused: "Cherry",
  },
  {
    name: "ArrowLeft moves to the previous chip and stops at the first",
    keys: "{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}",
    expected: { activeIndex: 0, selected: ["apple", "banana", "cherry"] },
    focused: "Apple",
  },
  {
    name: "ArrowRight past the last chip returns to the dropdown",
    keys: "{ArrowLeft}{ArrowLeft}{ArrowRight}{ArrowRight}",
    expected: { activeIndex: -1, selected: ["apple", "banana", "cherry"] },
    focused: "Dropdown",
  },
  {
    name: "Backspace in the dropdown removes the last chip",
    keys: "{Backspace}",
    expected: { activeIndex: -1, selected: ["apple", "banana"] },
    focused: "Dropdown",
  },
  {
    name: "Backspace on a chip removes it and keeps the index",
    keys: "{ArrowLeft}{ArrowLeft}{ArrowLeft}{Backspace}",
    expected: { activeIndex: 0, selected: ["banana", "cherry"] },
    focused: "Banana",
  },
  {
    name: "Delete on the last chip removes it and moves to the one before",
    keys: "{ArrowLeft}{Delete}",
    expected: { activeIndex: 1, selected: ["apple", "banana"] },
    focused: "Banana",
  },
];

describe("createMultipleSelection keyboard behaviour", () => {
  it.each(behaviour)("$name", async ({ keys, expected, focused }) => {
    const { state, dropdown, chip } = await setUp();
    await userEvent.keyboard(keys);
    await expect.poll(state).toEqual(expected);
    const target = focused === "Dropdown" ? dropdown : chip(focused);
    await expect.poll(() => document.activeElement).toBe(target);
  });

  it("gives the active chip the only tab stop", async () => {
    const { chip } = await setUp();
    expect(chip("Banana").getAttribute("tabindex")).toBe("-1");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect.poll(() => chip("Banana").getAttribute("tabindex")).toBe("0");
    expect(chip("Cherry").getAttribute("tabindex")).toBe("-1");
  });

  it("removing the only chip returns to the dropdown", async () => {
    const { state, dropdown } = await setUp({ items: [fruits[0]] });
    await userEvent.keyboard("{ArrowLeft}{Delete}");
    await expect.poll(state).toEqual({ activeIndex: -1, selected: [] });
    await expect.poll(() => document.activeElement).toBe(dropdown);
    // Backspace with nothing left to remove reports nothing.
    await userEvent.keyboard("{Backspace}");
    expect(state().selected).toEqual([]);
  });

  it("ignores Backspace and Delete on a chip that is not active", async () => {
    const { state, chip, onSelectedItemsChange } = await setUp();
    chip("Banana").focus();
    await userEvent.keyboard("{Backspace}{Delete}");
    expect(state().selected).toEqual(["apple", "banana", "cherry"]);
    expect(onSelectedItemsChange).not.toHaveBeenCalled();
  });

  it("leaves the dropdown's keys alone with a modifier or typed text", async () => {
    const { state, dropdown, onSelectedItemsChange } = await setUp();
    await userEvent.keyboard("{Shift>}{ArrowLeft}{Backspace}{/Shift}");
    await userEvent.keyboard("{Control>}{Backspace}{/Control}");
    await userEvent.keyboard("{Alt>}{Backspace}{/Alt}");
    await userEvent.keyboard("{Meta>}{Backspace}{/Meta}");
    expect(onSelectedItemsChange).not.toHaveBeenCalled();
    await userEvent.type(dropdown, "ap");
    await userEvent.keyboard("{ArrowLeft}{Backspace}");
    expect(state()).toEqual({
      activeIndex: -1,
      selected: ["apple", "banana", "cherry"],
    });
    // With the caret at the start of the text, the keys act again.
    dropdown.setSelectionRange(0, 0);
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => state().activeIndex).toBe(2);
  });

  it("leaves the dropdown alone while key actions are prevented", async () => {
    const { state, onSelectedItemsChange } = await setUp({
      isKeyActionPrevented: () => true,
    });
    await userEvent.keyboard("{ArrowLeft}{Backspace}");
    expect(state().activeIndex).toBe(-1);
    expect(onSelectedItemsChange).not.toHaveBeenCalled();
  });
});

describe("createMultipleSelection pointer behaviour", () => {
  it("returns to the dropdown on a click into it", async () => {
    const { state, dropdown } = await setUp();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(state).toMatchObject({ activeIndex: 2 });
    await userEvent.click(dropdown);
    await expect.poll(state).toMatchObject({ activeIndex: -1 });
  });

  it("removes a chip by item, and nothing for an unknown item", async () => {
    const { page, state, chip } = await setUp();
    await page.getByRole("button", { name: "Remove unknown" }).click();
    expect(state().selected).toEqual(["apple", "banana", "cherry"]);
    chip("Apple").click();
    await expect.poll(state).toEqual({
      activeIndex: -1,
      selected: ["banana", "cherry"],
    });
  });

  it("removing the last chip by item moves to the one before", async () => {
    const { state, chip } = await setUp();
    chip("Cherry").click();
    await expect.poll(state).toEqual({
      activeIndex: 1,
      selected: ["apple", "banana"],
    });
    await expect.poll(() => document.activeElement).toBe(chip("Banana"));
  });

  it("adds an item to the end", async () => {
    const { page, state, onSelectedItemsChange } = await setUp();
    await page.getByRole("button", { name: "Add" }).click();
    await expect
      .poll(() => state().selected)
      .toEqual(["apple", "banana", "cherry", "durian"]);
    expect(onSelectedItemsChange).toHaveBeenCalledOnce();
  });
});
