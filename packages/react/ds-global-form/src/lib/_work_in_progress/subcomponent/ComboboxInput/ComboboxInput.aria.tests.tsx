import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithForm } from "../../../../testing/renderWithForm.js";
import type { Option } from "../../../subcomponent/types.js";
import { ComboboxField } from "../../component/ComboboxField/index.js";
import { ComboboxInput } from "./ComboboxInput.js";

/**
 * The WAI-ARIA combobox pattern: the roles and states the pattern asks for,
 * the names of the chips, focus after a removal, and the keys of the list.
 * The Svelte form package checks the same rows in a browser. Where the
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

const getInput = () => screen.getByRole("combobox") as HTMLInputElement;

const getList = () => screen.getByRole("listbox", { hidden: true });

const getOptions = () => screen.getAllByRole("option", { hidden: true });

/** The index of the option `aria-activedescendant` points at, or -1. */
const readActiveIndex = () =>
  getOptions().findIndex(
    (option) => option.id === getInput().getAttribute("aria-activedescendant"),
  );

const readSelected = () =>
  getOptions().map((option) => option.getAttribute("aria-selected"));

const press = (key: string, target: Element = getInput()) =>
  fireEvent.keyDown(target, { key });

const readFocusedName = () =>
  document.activeElement?.getAttribute("aria-label");

describe("ComboboxInput roles and states", () => {
  it("is a list-autocomplete combobox that controls its listbox", () => {
    render(<ComboboxInput aria-label="Fruit" options={fruits} />);
    const input = getInput();
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-controls", getList().id);
    expect(getOptions()).toHaveLength(3);
  });

  it("says whether the list is expanded", () => {
    render(<ComboboxInput aria-label="Fruit" options={fruits} />);
    expect(getInput()).toHaveAttribute("aria-expanded", "false");
    press("ArrowDown");
    expect(getInput()).toHaveAttribute("aria-expanded", "true");
    press("Escape");
    expect(getInput()).toHaveAttribute("aria-expanded", "false");
  });

  it("points aria-activedescendant at the highlight only while open", () => {
    render(<ComboboxInput aria-label="Fruit" options={fruits} />);
    expect(getInput()).toHaveAttribute("aria-activedescendant", "");
    press("ArrowDown");
    expect(readActiveIndex()).toBe(0);
    press("ArrowDown");
    expect(readActiveIndex()).toBe(1);
    press("Escape");
    expect(getInput()).toHaveAttribute("aria-activedescendant", "");
  });

  it("marks the highlighted option selected in a single combobox", () => {
    render(<ComboboxInput aria-label="Fruit" options={fruits} />);
    expect(getList()).not.toHaveAttribute("aria-multiselectable");
    press("ArrowDown");
    press("ArrowDown");
    expect(readSelected()).toEqual(["false", "true", "false"]);
  });

  // The pattern and downshift differ here: downshift marks the highlight
  // selected in a multiple combobox too, so a screen reader cannot tell the
  // chosen options from the rest. The list is multi-selectable instead.
  it("marks the chosen options selected in a multiple combobox", () => {
    render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={["cherry"]}
      />,
    );
    expect(getList()).toHaveAttribute("aria-multiselectable", "true");
    expect(readSelected()).toEqual(["false", "false", "true"]);
    press("ArrowDown");
    expect(readActiveIndex()).toBe(0);
    expect(readSelected()).toEqual(["false", "false", "true"]);
  });
});

describe("ComboboxInput names", () => {
  it("names the input and the list by the field label", () => {
    const { container } = renderWithForm(
      <ComboboxField name="fruit" label="Fruit" options={fruits} />,
    );
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
    const label = container.querySelector("label") as HTMLLabelElement;
    expect(label.htmlFor).toBe(getInput().id);
    expect(getList()).toHaveAttribute("aria-labelledby", label.id);
  });

  it("names the input and the list by aria-label when standalone", () => {
    render(<ComboboxInput aria-label="Fruit" options={fruits} />);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
    expect(getInput()).not.toHaveAttribute("aria-labelledby");
    expect(getList()).toHaveAttribute("aria-label", "Fruit");
    expect(getList()).not.toHaveAttribute("aria-labelledby");
  });

  it("names the input and the list by aria-labelledby when standalone", () => {
    render(<ComboboxInput aria-labelledby="fruit-heading" options={fruits} />);
    expect(getInput()).toHaveAttribute("aria-labelledby", "fruit-heading");
    expect(getList()).toHaveAttribute("aria-labelledby", "fruit-heading");
  });

  it("describes the input by the field description and error", () => {
    renderWithForm(
      <ComboboxField
        name="fruit"
        label="Fruit"
        description="Seasonal only"
        options={fruits}
      />,
      {
        formProps: {
          errors: { fruit: { type: "manual", message: "Pick a fruit" } },
        },
      },
    );
    const input = getInput();
    expect(input).toHaveAccessibleDescription("Seasonal only Pick a fruit");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-errormessage")).toMatch(/-error$/);
    expect(input).toHaveAttribute("aria-required", "true");
    // The visible text is not the value, so it is not natively required.
    expect(input.required).toBe(false);
  });

  it("names each chip by the removal it performs", () => {
    const { container } = render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={["apple", "banana"]}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Remove Apple" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Banana" }),
    ).toBeInTheDocument();
    for (const icon of container.querySelectorAll(".chip .remove-icon")) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
    expect(
      screen.getByRole("button", { name: "Clear selection" }),
    ).toBeInTheDocument();
  });

  // No status message is passed to downshift, so neither combobox announces
  // a pick or a removal through a live region.
  it("announces nothing through a live region", () => {
    render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={["apple"]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove Apple" }));
    expect(document.querySelector("[aria-live]")).toBeNull();
  });
});

describe("ComboboxInput focus order", () => {
  it("keeps the chips out of the tab order until one is reached", () => {
    const { container } = render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={["apple", "banana"]}
      />,
    );
    const chips = [...container.querySelectorAll(".chip")];
    expect(chips.map((chip) => chip.getAttribute("tabindex"))).toEqual([
      "-1",
      "-1",
    ]);
    act(() => getInput().focus());
    press("ArrowLeft");
    expect(readFocusedName()).toBe("Remove Banana");
    expect(chips.map((chip) => chip.getAttribute("tabindex"))).toEqual([
      "-1",
      "0",
    ]);
  });

  it("leaves a disabled combobox, its chips and its clear button out", () => {
    const { container } = render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        disabled
        options={fruits}
        value={["apple"]}
      />,
    );
    for (const control of container.querySelectorAll("input, button")) {
      expect(control).toBeDisabled();
    }
  });

  /** Focuses a chip by keyboard, from the input, making it the active one. */
  const arrowToChip = (steps: number) => {
    act(() => getInput().focus());
    for (let step = 0; step < steps; step++) {
      press("ArrowLeft", document.activeElement as Element);
    }
  };

  /** Focuses a chip directly, as a click does, leaving no chip active. */
  const focusChip = (name: string) =>
    act(() => screen.getByRole("button", { name }).focus());

  /** Removes the focused chip: by its key, or by activating it. */
  const removeFocused = (key: string) => {
    const chip = document.activeElement as HTMLElement;
    if (key === "Enter") fireEvent.click(chip);
    else press(key, chip);
  };

  it.each([
    {
      name: "a middle chip with Delete moves focus to the chip after it",
      reach: () => arrowToChip(2),
      key: "Delete",
      focused: "Remove Cherry",
    },
    {
      name: "the last chip with Backspace moves focus to the chip before it",
      reach: () => arrowToChip(1),
      key: "Backspace",
      focused: "Remove Banana",
    },
    {
      name: "a focused middle chip with Enter moves focus to the chip after it",
      reach: () => focusChip("Remove Banana"),
      key: "Enter",
      focused: "Remove Cherry",
    },
    {
      name: "a focused last chip with Enter moves focus to the chip before it",
      reach: () => focusChip("Remove Cherry"),
      key: "Enter",
      focused: "Remove Banana",
    },
  ])("removing $name", ({ reach, key, focused }) => {
    const { container } = render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={["apple", "banana", "cherry"]}
      />,
    );
    reach();
    removeFocused(key);
    expect(container.querySelectorAll(".chip")).toHaveLength(2);
    expect(readFocusedName()).toBe(focused);
  });

  it.each([
    { name: "with Backspace", reach: () => arrowToChip(1), key: "Backspace" },
    {
      name: "focused, with Enter",
      reach: () => focusChip("Remove Apple"),
      key: "Enter",
    },
  ])(
    "removing the only chip $name moves focus to the input",
    ({ reach, key }) => {
      render(
        <ComboboxInput
          aria-label="Fruits"
          isMultiple
          options={fruits}
          value={["apple"]}
        />,
      );
      reach();
      expect(readFocusedName()).toBe("Remove Apple");
      removeFocused(key);
      expect(document.activeElement).toBe(getInput());
    },
  );

  it("leaves focus alone when a chip that does not hold it is removed", () => {
    const { container } = render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={["apple", "banana"]}
      />,
    );
    act(() => getInput().focus());
    fireEvent.click(screen.getByRole("button", { name: "Remove Apple" }));
    expect(container.querySelectorAll(".chip")).toHaveLength(1);
    expect(document.activeElement).toBe(getInput());
  });

  it("returns focus to the input on reset", () => {
    render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={["apple"]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(document.activeElement).toBe(getInput());
  });
});

/**
 * The list keys in the whole combobox, single and multiple. Each row opens
 * the list with ArrowDown, presses `keys` and expects the highlight and
 * whether the list is open.
 */
const listKeys: {
  name: string;
  keys: string[];
  highlight: number;
  open: boolean;
}[] = [
  {
    name: "End highlights the last option",
    keys: ["End"],
    highlight: 24,
    open: true,
  },
  {
    name: "Home highlights the first option",
    keys: ["End", "Home"],
    highlight: 0,
    open: true,
  },
  {
    name: "PageDown moves ten options down",
    keys: ["PageDown"],
    highlight: 10,
    open: true,
  },
  {
    name: "PageUp moves ten options up",
    keys: ["PageDown", "PageDown", "PageUp"],
    highlight: 10,
    open: true,
  },
  // The pattern and downshift differ here: downshift wraps a page move past
  // an end to the other end; the WAI-ARIA listbox pattern stops it there.
  {
    name: "PageDown stops at the last option",
    keys: ["End", "ArrowUp", "PageDown"],
    highlight: 24,
    open: true,
  },
  {
    name: "PageUp stops at the first option",
    keys: ["ArrowDown", "PageUp"],
    highlight: 0,
    open: true,
  },
  {
    name: "Escape closes the list",
    keys: ["Escape"],
    highlight: -1,
    open: false,
  },
];

describe.each([
  { mode: "single", isMultiple: false },
  { mode: "multiple", isMultiple: true },
])("ComboboxInput list keys ($mode)", ({ isMultiple }) => {
  it.each(listKeys)("$name", ({ keys, highlight, open }) => {
    render(
      <ComboboxInput
        aria-label="Fruit"
        isMultiple={isMultiple}
        options={manyFruits}
        value={isMultiple ? [] : undefined}
      />,
    );
    press("ArrowDown");
    for (const key of keys) press(key);
    expect(readActiveIndex()).toBe(highlight);
    expect(getInput()).toHaveAttribute("aria-expanded", String(open));
  });

  it("Home and End leave a closed list closed", () => {
    render(
      <ComboboxInput
        aria-label="Fruit"
        isMultiple={isMultiple}
        options={manyFruits}
      />,
    );
    for (const key of ["Home", "End", "PageUp", "PageDown"]) press(key);
    expect(getInput()).toHaveAttribute("aria-expanded", "false");
  });

  it("Escape on a closed list clears the text", () => {
    render(
      <ComboboxInput
        aria-label="Fruit"
        isMultiple={isMultiple}
        options={manyFruits}
      />,
    );
    fireEvent.change(getInput(), { target: { value: "Fruit 1" } });
    press("Escape");
    press("Escape");
    expect(getInput()).toHaveValue("");
  });
});

describe("ComboboxInput Escape with a selection", () => {
  it("clears a single selection on a closed list", () => {
    render(
      <ComboboxInput aria-label="Fruit" options={fruits} value="banana" />,
    );
    press("Escape");
    expect(getInput()).toHaveValue("");
  });

  it("keeps the chips of a multiple combobox", () => {
    const { container } = render(
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={["banana"]}
      />,
    );
    press("Escape");
    expect(container.querySelectorAll(".chip")).toHaveLength(1);
  });
});
