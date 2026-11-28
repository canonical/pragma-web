import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Combobox from "../../../../testing/Combobox.fixtures.svelte";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

type State = {
  isOpen: boolean;
  highlightedIndex: number;
  inputValue: string;
  selected: string | null;
};

/** Reads the builder state the fixture prints. */
const readState = (container: HTMLElement): State =>
  JSON.parse(
    container.querySelector('[data-testid="state"]')?.textContent ?? "{}",
  );

const setUp = async (
  props: Partial<{ initialSelectedItem: (typeof fruits)[number] }> = {},
) => {
  const onSelectedItemChange = vi.fn();
  const page = await render(Combobox, {
    items: fruits,
    onSelectedItemChange,
    ...props,
  });
  const input = page.container.querySelector("input") as HTMLInputElement;
  input.focus();
  return {
    page,
    input,
    onSelectedItemChange,
    state: () => readState(page.container),
  };
};

/**
 * The keyboard behaviour of the combobox, after downshift's state reducer and
 * the WAI-ARIA "combobox with list autocomplete" pattern. Each row starts with
 * focus in the input, optionally with Banana selected, presses `keys`
 * (`userEvent.keyboard` syntax) and expects the resulting state.
 */
const behaviour: {
  name: string;
  selected?: boolean;
  keys: string;
  expected: Partial<State>;
}[] = [
  {
    name: "ArrowDown opens the list on the first item",
    keys: "{ArrowDown}",
    expected: { isOpen: true, highlightedIndex: 0 },
  },
  {
    name: "ArrowDown opens the list on the selected item",
    selected: true,
    keys: "{ArrowDown}",
    expected: { isOpen: true, highlightedIndex: 1 },
  },
  {
    name: "ArrowDown moves down and wraps to the first item",
    keys: "{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}",
    expected: { highlightedIndex: 0 },
  },
  {
    name: "ArrowUp opens the list on the last item",
    keys: "{ArrowUp}",
    expected: { isOpen: true, highlightedIndex: 2 },
  },
  {
    name: "ArrowUp moves up and wraps to the last item",
    keys: "{ArrowDown}{ArrowUp}",
    expected: { highlightedIndex: 2 },
  },
  {
    name: "Alt+ArrowDown opens the list without a highlight",
    keys: "{Alt>}{ArrowDown}{/Alt}",
    expected: { isOpen: true, highlightedIndex: -1 },
  },
  {
    name: "Alt+ArrowDown opens the list on the selected item",
    selected: true,
    keys: "{Alt>}{ArrowDown}{/Alt}",
    expected: { isOpen: true, highlightedIndex: 1 },
  },
  {
    name: "Alt+ArrowUp selects the highlighted item and closes",
    keys: "{ArrowDown}{ArrowDown}{Alt>}{ArrowUp}{/Alt}",
    expected: { isOpen: false, selected: "banana", inputValue: "Banana" },
  },
  {
    name: "End highlights the last item",
    keys: "{ArrowDown}{End}",
    expected: { highlightedIndex: 2 },
  },
  {
    name: "Home highlights the first item",
    keys: "{ArrowUp}{Home}",
    expected: { highlightedIndex: 0 },
  },
  {
    name: "Home and End do nothing on a closed list",
    keys: "{Home}{End}",
    expected: { isOpen: false, highlightedIndex: -1 },
  },
  {
    name: "PageUp moves ten items up, stopping at the first",
    keys: "{ArrowUp}{PageUp}",
    expected: { highlightedIndex: 0 },
  },
  {
    name: "PageDown moves ten items down, stopping at the last",
    keys: "{ArrowDown}{PageDown}",
    expected: { highlightedIndex: 2 },
  },
  {
    name: "PageUp and PageDown do nothing on a closed list",
    keys: "{PageUp}{PageDown}",
    expected: { isOpen: false, highlightedIndex: -1 },
  },
  {
    name: "Enter selects the highlighted item and closes",
    keys: "{ArrowDown}{ArrowDown}{ArrowDown}{Enter}",
    expected: {
      isOpen: false,
      highlightedIndex: -1,
      selected: "cherry",
      inputValue: "Cherry",
    },
  },
  {
    name: "Enter without a highlight closes without selecting",
    keys: "{Alt>}{ArrowDown}{/Alt}{Enter}",
    expected: { isOpen: false, selected: null },
  },
  {
    name: "Enter on a closed list does nothing",
    keys: "{Enter}",
    expected: { isOpen: false, selected: null },
  },
  {
    name: "Escape closes the list and keeps the selection",
    selected: true,
    keys: "{ArrowDown}{ArrowDown}{Escape}",
    expected: { isOpen: false, selected: "banana", inputValue: "Banana" },
  },
  {
    name: "Escape on a closed list clears the selection and the text",
    selected: true,
    keys: "{Escape}",
    expected: { selected: null, inputValue: "" },
  },
  {
    name: "Escape on a closed list clears typed text",
    keys: "ch{Escape}{Escape}",
    expected: { isOpen: false, inputValue: "" },
  },
  {
    name: "Typing opens the list without a highlight",
    keys: "{ArrowDown}b",
    expected: { isOpen: true, highlightedIndex: -1, inputValue: "b" },
  },
  {
    name: "Tab selects the highlighted item and leaves",
    keys: "{ArrowDown}{Tab}",
    expected: { isOpen: false, selected: "apple", inputValue: "Apple" },
  },
  {
    name: "Tab without a highlight closes without selecting",
    keys: "{Alt>}{ArrowDown}{/Alt}{Tab}",
    expected: { isOpen: false, selected: null },
  },
];

describe("createCombobox keyboard behaviour", () => {
  it.each(behaviour)("$name", async ({ selected, keys, expected }) => {
    const { state } = await setUp(
      selected ? { initialSelectedItem: fruits[1] } : {},
    );
    await userEvent.keyboard(keys);
    await expect.poll(state).toMatchObject(expected);
  });

  it("reports a selection the user makes, and only that", async () => {
    const { onSelectedItemChange, state } = await setUp({
      initialSelectedItem: fruits[1],
    });
    expect(onSelectedItemChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    // Re-selecting the selected item is no change.
    expect(onSelectedItemChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect.poll(state).toMatchObject({ selected: "cherry" });
    expect(onSelectedItemChange).toHaveBeenCalledExactlyOnceWith(fruits[2]);
  });

  it("reports every pick of a selection pinned to null", async () => {
    const onSelectedItemChange = vi.fn();
    const page = await render(Combobox, {
      items: fruits,
      isSelectionPinned: true,
      onSelectedItemChange,
    });
    (page.container.querySelector("input") as HTMLInputElement).focus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    // A pinned selection opens without a highlight, as nothing is selected.
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect
      .poll(() => onSelectedItemChange.mock.calls)
      .toEqual([[fruits[0]], [fruits[0]]]);
    expect(readState(page.container)).toMatchObject({
      selected: null,
      inputValue: "Apple",
    });
  });

  it("does not prevent a closed list's Enter, so a form can submit", async () => {
    const { input } = await setUp();
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("leaves Enter to an input method that is composing text", async () => {
    const { input, state } = await setUp();
    await userEvent.keyboard("{ArrowDown}");
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      isComposing: true,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(state()).toMatchObject({ isOpen: true, highlightedIndex: 0 });
  });

  it("ignores Escape when there is nothing to close or clear", async () => {
    const { input } = await setUp();
    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("highlights nothing in an empty list", async () => {
    const page = await render(Combobox, { items: [] });
    const input = page.container.querySelector("input") as HTMLInputElement;
    input.focus();
    await userEvent.keyboard("{ArrowDown}{End}");
    expect(readState(page.container)).toMatchObject({
      isOpen: true,
      highlightedIndex: -1,
    });
    await userEvent.keyboard("{ArrowDown}{Home}{Enter}");
    expect(readState(page.container)).toMatchObject({ isOpen: false });
  });
});

describe("createCombobox pointer behaviour", () => {
  it("toggles the list on an input click", async () => {
    const { input, state } = await setUp();
    await userEvent.click(input);
    await expect.poll(state).toMatchObject({
      isOpen: true,
      highlightedIndex: -1,
    });
    await userEvent.click(input);
    await expect.poll(state).toMatchObject({ isOpen: false });
  });

  it("selects a clicked item and keeps focus in the input", async () => {
    const { page, input, state } = await setUp();
    await userEvent.click(input);
    await page.getByRole("option", { name: "Cherry" }).click();
    await expect.poll(state).toMatchObject({
      isOpen: false,
      selected: "cherry",
      inputValue: "Cherry",
    });
    expect(document.activeElement).toBe(input);
  });

  it("highlights the item under the mouse, and nothing once it leaves", async () => {
    const { page, input, state } = await setUp();
    await userEvent.click(input);
    await page.getByRole("option", { name: "Banana" }).hover();
    await expect.poll(state).toMatchObject({ highlightedIndex: 1 });
    const menu = page.container.querySelector("ul") as HTMLElement;
    menu.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    menu
      .querySelectorAll("li")[1]
      .dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    menu.dispatchEvent(new MouseEvent("mouseleave"));
    await expect.poll(state).toMatchObject({ highlightedIndex: -1 });
  });

  it("opens from the toggle button and brings focus to the input", async () => {
    const { page, input, state } = await setUp({
      initialSelectedItem: fruits[2],
    });
    const toggle = page.getByRole("button", { name: "Toggle" });
    expect(toggle.element().getAttribute("tabindex")).toBe("-1");
    await toggle.click();
    await expect.poll(state).toMatchObject({
      isOpen: true,
      highlightedIndex: 2,
    });
    await expect.poll(() => document.activeElement).toBe(input);
    await toggle.click();
    await expect.poll(state).toMatchObject({ isOpen: false });
  });

  it("closes on a click outside, without selecting", async () => {
    const { page, input, state } = await setUp();
    const outside = page.getByRole("button", { name: "Next" });
    await userEvent.keyboard("{ArrowDown}");
    await outside.click();
    await expect.poll(state).toMatchObject({ isOpen: false, selected: null });
    // A click outside a closed list changes nothing.
    await outside.click();
    expect(state().isOpen).toBe(false);
    expect(input.value).toBe("");
  });

  it("stays open while focus stays inside, or the event has no node", async () => {
    const { state } = await setUp();
    await userEvent.keyboard("{ArrowDown}");
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    window.dispatchEvent(new MouseEvent("mouseup"));
    expect(state().isOpen).toBe(true);
  });

  it("closes on a tap outside, but not after a touch scroll", async () => {
    const { state } = await setUp();
    await userEvent.keyboard("{ArrowDown}");
    const touch = (type: string) =>
      document.body.dispatchEvent(new Event(type, { bubbles: true }));
    touch("touchstart");
    touch("touchmove");
    touch("touchend");
    expect(state().isOpen).toBe(true);
    touch("touchstart");
    touch("touchend");
    await expect.poll(state).toMatchObject({ isOpen: false });
  });

  it("ignores the mouse moving over an item just after a tap", async () => {
    const { page, input, state } = await setUp();
    await userEvent.click(input);
    page.container
      .querySelectorAll("li")[0]
      .dispatchEvent(new Event("touchend", { bubbles: true }));
    page.container
      .querySelectorAll("li")[1]
      .dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    expect(state().highlightedIndex).toBe(-1);
  });

  it("closes without selecting when focus leaves the window", async () => {
    const { input, state } = await setUp();
    await userEvent.keyboard("{ArrowDown}");
    input.dispatchEvent(new FocusEvent("blur", { relatedTarget: null }));
    await expect.poll(state).toMatchObject({ isOpen: false, selected: null });
  });
});

describe("createCombobox markup", () => {
  it("wires downshift's IDs and ARIA between the parts", async () => {
    const { page, input } = await setUp();
    const label = page.container.querySelector("label") as HTMLLabelElement;
    const menu = page.container.querySelector("ul") as HTMLElement;
    expect(label.id).toBe("cb-label");
    expect(label.htmlFor).toBe("cb-input");
    expect(input.id).toBe("cb-input");
    expect(input.getAttribute("aria-labelledby")).toBe("cb-label");
    expect(input.getAttribute("aria-controls")).toBe("cb-menu");
    expect(input.getAttribute("autocomplete")).toBe("off");
    expect(menu.id).toBe("cb-menu");
    expect(menu.getAttribute("aria-labelledby")).toBe("cb-label");
    const toggle = page.getByRole("button", { name: "Toggle" }).element();
    expect(toggle.id).toBe("cb-toggle-button");
    expect(toggle.getAttribute("aria-controls")).toBe("cb-menu");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect
      .poll(() => input.getAttribute("aria-activedescendant"))
      .toBe("cb-item-1");
    const items = menu.querySelectorAll("li");
    expect(items[1].getAttribute("aria-selected")).toBe("true");
    expect(items[0].getAttribute("aria-selected")).toBe("false");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("scrolls a highlight moved by the keyboard into view", async () => {
    const many = Array.from({ length: 40 }, (_, index) => ({
      value: `v${index}`,
      label: `Item ${index}`,
    }));
    const page = await render(Combobox, { items: many });
    const menu = page.container.querySelector("ul") as HTMLElement;
    menu.style.cssText = "height: 60px; overflow: auto";
    (page.container.querySelector("input") as HTMLInputElement).focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => menu.scrollTop).toBeGreaterThan(0);
  });
});
