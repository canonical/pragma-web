import { describe, expect, it } from "vitest";
import { page as browserPage, userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import type { Option } from "../../../subcomponent/types.js";
import { ComboboxField } from "../../component/ComboboxField/index.js";
import { ComboboxInput } from "./index.js";

/**
 * The WAI-ARIA combobox pattern, checked in a browser: the roles and states
 * the pattern asks for, the names of the chips, the focus order, and the keys
 * of the list, against what React's downshift-based combobox does. Where the
 * pattern and downshift differ, the pattern wins; each such row says so.
 */

const fruits: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

/** Enough options for a page move not to reach an end. */
const manyFruits: Option[] = Array.from({ length: 25 }, (_, index) => ({
  value: `fruit-${index}`,
  label: `Fruit ${index}`,
}));

const getInput = () =>
  browserPage.getByRole("combobox").element() as HTMLInputElement;

const getList = () =>
  document.querySelector('[role="listbox"]') as HTMLUListElement;

const getOptions = () => [
  ...document.querySelectorAll<HTMLElement>('[role="option"]'),
];

/** The index of the option `aria-activedescendant` points at, or -1. */
const readActiveIndex = () =>
  getOptions().findIndex(
    (option) => option.id === getInput().getAttribute("aria-activedescendant"),
  );

const readSelected = () =>
  getOptions().map((option) => option.getAttribute("aria-selected"));

const isExpanded = () => getInput().getAttribute("aria-expanded");

describe("ComboboxInput roles and states", () => {
  it("is a list-autocomplete combobox that controls its listbox", async () => {
    await render(ComboboxInput, { "aria-label": "Fruit", options: fruits });
    const input = getInput();
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-controls")).toBe(getList().id);
    expect(getList().getAttribute("role")).toBe("listbox");
    expect(getOptions()).toHaveLength(3);
  });

  it("says whether the list is expanded", async () => {
    await render(ComboboxInput, { "aria-label": "Fruit", options: fruits });
    expect(isExpanded()).toBe("false");
    getInput().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(isExpanded).toBe("true");
    await userEvent.keyboard("{Escape}");
    await expect.poll(isExpanded).toBe("false");
  });

  it("points aria-activedescendant at the highlight only while open", async () => {
    await render(ComboboxInput, { "aria-label": "Fruit", options: fruits });
    expect(getInput().getAttribute("aria-activedescendant")).toBe("");
    getInput().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(readActiveIndex).toBe(0);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(readActiveIndex).toBe(1);
    await userEvent.keyboard("{Escape}");
    await expect
      .poll(() => getInput().getAttribute("aria-activedescendant"))
      .toBe("");
  });

  it("marks the highlighted option selected in a single combobox", async () => {
    await render(ComboboxInput, { "aria-label": "Fruit", options: fruits });
    expect(getList().hasAttribute("aria-multiselectable")).toBe(false);
    getInput().focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect.poll(readSelected).toEqual(["false", "true", "false"]);
  });

  // The pattern and downshift differ here: downshift marks the highlight
  // selected in a multiple combobox too, so a screen reader cannot tell the
  // chosen options from the rest. The list is multi-selectable instead.
  it("marks the chosen options selected in a multiple combobox", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["cherry"],
    });
    expect(getList().getAttribute("aria-multiselectable")).toBe("true");
    expect(readSelected()).toEqual(["false", "false", "true"]);
    getInput().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(readActiveIndex).toBe(0);
    expect(readSelected()).toEqual(["false", "false", "true"]);
  });
});

describe("ComboboxInput names", () => {
  it("names the input and the list by the field label", async () => {
    await render(ComboboxField, {
      name: "fruit",
      label: "Fruit",
      options: fruits,
    });
    // The required marker is part of the label.
    const input = browserPage.getByRole("combobox", { name: /^Fruit/ });
    await expect.element(input).toBeInTheDocument();
    const label = document.querySelector("label") as HTMLLabelElement;
    expect(label.htmlFor).toBe(getInput().id);
    expect(getList().getAttribute("aria-labelledby")).toBe(label.id);
  });

  it("names the input and the list by aria-label when standalone", async () => {
    await render(ComboboxInput, { "aria-label": "Fruit", options: fruits });
    await expect
      .element(browserPage.getByRole("combobox", { name: "Fruit" }))
      .toBeInTheDocument();
    expect(getInput().hasAttribute("aria-labelledby")).toBe(false);
    expect(getList().getAttribute("aria-label")).toBe("Fruit");
    expect(getList().hasAttribute("aria-labelledby")).toBe(false);
  });

  it("names the input and the list by aria-labelledby when standalone", async () => {
    await render(ComboboxInput, {
      "aria-labelledby": "fruit-heading",
      options: fruits,
    });
    expect(getInput().getAttribute("aria-labelledby")).toBe("fruit-heading");
    expect(getList().getAttribute("aria-labelledby")).toBe("fruit-heading");
  });

  it("describes the input by the field description and error", async () => {
    await render(ComboboxField, {
      name: "fruit",
      label: "Fruit",
      description: "Seasonal only",
      error: "Pick a fruit",
      options: fruits,
    });
    const input = getInput();
    await expect
      .element(browserPage.getByRole("combobox"))
      .toHaveAccessibleDescription("Seasonal only Pick a fruit");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-errormessage")).toMatch(/-error$/);
    expect(input.getAttribute("aria-required")).toBe("true");
    // The visible text is not the value, so it is not natively required.
    expect(input.required).toBe(false);
  });

  it("names each chip by the removal it performs", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana"],
    });
    await expect
      .element(browserPage.getByRole("button", { name: "Remove Apple" }))
      .toBeInTheDocument();
    await expect
      .element(browserPage.getByRole("button", { name: "Remove Banana" }))
      .toBeInTheDocument();
    for (const icon of document.querySelectorAll(".chip .remove-icon"))
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    await expect
      .element(browserPage.getByRole("button", { name: "Clear selection" }))
      .toBeInTheDocument();
  });

  // React passes downshift no status message, so neither combobox announces
  // a pick or a removal through a live region.
  it("announces nothing through a live region", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple"],
    });
    await browserPage.getByRole("button", { name: "Remove Apple" }).click();
    expect(document.querySelector("[aria-live]")).toBeNull();
  });
});

describe("ComboboxInput focus order", () => {
  it("tabs from the input to the clear button, past the chips", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana"],
    });
    getInput().focus();
    await userEvent.tab();
    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Clear selection",
    );
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(getInput());
  });

  it("reaches the chips with ArrowLeft and keeps one tab stop among them", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana"],
    });
    getInput().focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect
      .poll(() => document.activeElement?.getAttribute("aria-label"))
      .toBe("Remove Banana");
    const tabStops = [...document.querySelectorAll(".chip")].map((chip) =>
      chip.getAttribute("tabindex"),
    );
    expect(tabStops).toEqual(["-1", "0"]);
  });

  it("leaves a disabled combobox, its chips and its clear button out", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      disabled: true,
      options: fruits,
      value: ["apple"],
    });
    for (const control of document.querySelectorAll("input, button"))
      expect((control as HTMLInputElement).disabled).toBe(true);
  });

  /** Focuses a chip by keyboard, from the input, making it the active one. */
  const arrowToChip = async (steps: number) => {
    getInput().focus();
    await userEvent.keyboard("{ArrowLeft}".repeat(steps));
  };

  /** Focuses a chip directly, as a click does, leaving no chip active. */
  const focusChip = (name: string) =>
    (
      browserPage.getByRole("button", { name }).element() as HTMLElement
    ).focus();

  const readFocusedName = () =>
    document.activeElement?.getAttribute("aria-label");

  it.each([
    {
      name: "a middle chip with Delete moves focus to the chip after it",
      reach: () => arrowToChip(2),
      key: "{Delete}",
      focused: "Remove Cherry",
    },
    {
      name: "the last chip with Backspace moves focus to the chip before it",
      reach: () => arrowToChip(1),
      key: "{Backspace}",
      focused: "Remove Banana",
    },
    {
      name: "a focused middle chip with Enter moves focus to the chip after it",
      reach: () => focusChip("Remove Banana"),
      key: "{Enter}",
      focused: "Remove Cherry",
    },
    {
      name: "a focused last chip with Enter moves focus to the chip before it",
      reach: () => focusChip("Remove Cherry"),
      key: "{Enter}",
      focused: "Remove Banana",
    },
  ])("removing $name", async ({ reach, key, focused }) => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana", "cherry"],
    });
    await reach();
    await userEvent.keyboard(key);
    await expect.poll(() => document.querySelectorAll(".chip").length).toBe(2);
    await expect.poll(readFocusedName).toBe(focused);
  });

  it.each([
    { name: "with Backspace", reach: () => arrowToChip(1), key: "{Backspace}" },
    {
      name: "focused, with Enter",
      reach: () => focusChip("Remove Apple"),
      key: "{Enter}",
    },
  ])(
    "removing the only chip $name moves focus to the input",
    async ({ reach, key }) => {
      await render(ComboboxInput, {
        "aria-label": "Fruits",
        isMultiple: true,
        options: fruits,
        value: ["apple"],
      });
      await reach();
      await expect.poll(readFocusedName).toBe("Remove Apple");
      await userEvent.keyboard(key);
      await expect.poll(() => document.activeElement).toBe(getInput());
    },
  );

  it("leaves focus alone when a chip that does not hold it is removed", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana"],
    });
    getInput().focus();
    (
      browserPage
        .getByRole("button", { name: "Remove Apple" })
        .element() as HTMLElement
    ).click();
    await expect.poll(() => document.querySelectorAll(".chip").length).toBe(1);
    expect(document.activeElement).toBe(getInput());
  });

  it("returns focus to the input on reset", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple"],
    });
    await browserPage.getByRole("button", { name: "Clear selection" }).click();
    await expect.poll(() => document.activeElement).toBe(getInput());
  });
});

/**
 * The list keys in the whole combobox, single and multiple, as React's
 * downshift combobox handles them. Each row opens the list with ArrowDown,
 * presses `keys` and expects the highlight and whether the list is open.
 */
const listKeys: {
  name: string;
  keys: string;
  highlight: number;
  open: boolean;
}[] = [
  {
    name: "End highlights the last option",
    keys: "{End}",
    highlight: 24,
    open: true,
  },
  {
    name: "Home highlights the first option",
    keys: "{End}{Home}",
    highlight: 0,
    open: true,
  },
  {
    name: "PageDown moves ten options down",
    keys: "{PageDown}",
    highlight: 10,
    open: true,
  },
  {
    name: "PageUp moves ten options up",
    keys: "{PageDown}{PageDown}{PageUp}",
    highlight: 10,
    open: true,
  },
  // The pattern and downshift differ here: downshift wraps a page move past
  // an end to the other end; the WAI-ARIA listbox pattern stops it there.
  {
    name: "PageDown stops at the last option",
    keys: "{End}{ArrowUp}{PageDown}",
    highlight: 24,
    open: true,
  },
  {
    name: "PageUp stops at the first option",
    keys: "{ArrowDown}{PageUp}",
    highlight: 0,
    open: true,
  },
  {
    name: "Escape closes the list",
    keys: "{Escape}",
    highlight: -1,
    open: false,
  },
];

describe.each([
  { mode: "single", isMultiple: false },
  { mode: "multiple", isMultiple: true },
])("ComboboxInput list keys ($mode)", ({ isMultiple }) => {
  it.each(listKeys)("$name", async ({ keys, highlight, open }) => {
    await render(ComboboxInput, {
      "aria-label": "Fruit",
      isMultiple,
      options: manyFruits,
      ...(isMultiple && { value: [] }),
    });
    getInput().focus();
    await userEvent.keyboard(`{ArrowDown}${keys}`);
    await expect.poll(readActiveIndex).toBe(highlight);
    expect(isExpanded()).toBe(String(open));
  });

  it("Home and End leave a closed list closed", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruit",
      isMultiple,
      options: manyFruits,
    });
    getInput().focus();
    await userEvent.keyboard("{Home}{End}{PageUp}{PageDown}");
    expect(isExpanded()).toBe("false");
  });

  it("Escape on a closed list clears the text", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruit",
      isMultiple,
      options: manyFruits,
    });
    getInput().focus();
    await userEvent.keyboard("Fruit 1{Escape}{Escape}");
    await expect.poll(() => getInput().value).toBe("");
  });
});

describe("ComboboxInput Escape with a selection", () => {
  it("clears a single selection on a closed list", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruit",
      options: fruits,
      value: "banana",
    });
    getInput().focus();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => getInput().value).toBe("");
  });

  it("keeps the chips of a multiple combobox", async () => {
    await render(ComboboxInput, {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["banana"],
    });
    getInput().focus();
    await userEvent.keyboard("{Escape}");
    expect(document.querySelectorAll(".chip")).toHaveLength(1);
  });
});
