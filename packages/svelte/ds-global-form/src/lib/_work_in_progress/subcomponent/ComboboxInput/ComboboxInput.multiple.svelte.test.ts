import { describe, expect, it, vi } from "vitest";
import { page as browserPage, userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ComboboxHarness from "../../../../testing/ComboboxHarness.fixtures.svelte";
import OwnedForm from "../../../../testing/OwnedForm.fixtures.svelte";
import readBound from "../../../../testing/readBound.js";
import type { Option } from "../../../subcomponent/types.js";
import createFormState from "../../../utils/owner/createFormState.svelte.js";
import { ComboboxInput } from "./index.js";
import type { ConvertValueToItem } from "./types.js";

const fruits: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

/**
 * The visible selection is the set of chips. Query them directly: the list
 * also renders each option, so a text query would conflate the two.
 */
const readChips = (container: HTMLElement): string[] =>
  [...container.querySelectorAll(".selected-items .chip")].map((chip) =>
    (chip.textContent ?? "").replace("×", "").trim(),
  );

/** The values a native submission of the rendered form would post. */
const readPosted = (container: HTMLElement, name: string): string[] =>
  new FormData(container.querySelector("form") as HTMLFormElement)
    .getAll(name)
    .map(String);

const getInput = () =>
  browserPage.getByRole("combobox").element() as HTMLInputElement;

/** Picks an option from the list, opening it first. */
const pick = async (label: string) => {
  if (getInput().getAttribute("aria-expanded") !== "true")
    await userEvent.click(getInput());
  await browserPage.getByRole("option", { name: label }).click();
};

/** A promise whose answer the test hands over when it chooses. */
function deferred<T>() {
  let resolve: (answer: T) => void = () => {};
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

const byValue = (value: string): Option | null =>
  fruits.find((fruit) => fruit.value === value) ?? null;

/** Lets pending promises and the effects they start settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe("ComboboxInput (multiple)", () => {
  it("renders chips for each value", async () => {
    const page = await render(ComboboxInput, {
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana", "cherry"],
    });
    expect(readChips(page.container)).toEqual(["Apple", "Banana", "Cherry"]);
  });

  it("wires downshift's IDs and ARIA to the input and the list", async () => {
    const page = await render(ComboboxInput, {
      isMultiple: true,
      options: fruits,
    });
    const input = getInput();
    const menu = page.container.querySelector("ul") as HTMLElement;
    expect(input.id).toMatch(/^downshift-.+-input$/);
    expect(input.getAttribute("aria-controls")).toBe(menu.id);
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .poll(() => input.getAttribute("aria-activedescendant"))
      .toBe(page.container.querySelectorAll("li")[0].id);
  });

  it("calls onblur when the input loses focus", async () => {
    const onblur = vi.fn();
    await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      onblur,
    });
    getInput().focus();
    await userEvent.tab();
    expect(onblur).toHaveBeenCalledOnce();
  });

  it("adds a pick as a chip, clears the text and lists every option", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: [],
    });
    await userEvent.type(getInput(), "ch");
    await expect
      .poll(() => page.container.querySelectorAll("li").length)
      .toBe(1);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect.poll(() => readBound(page.container)).toEqual(["cherry"]);
    expect(getInput().value).toBe("");
    expect(page.getByTestId("text").element().textContent).toBe("");
    expect(page.container.querySelectorAll("li")).toHaveLength(3);
    expect(page.container.querySelectorAll("li.selected")).toHaveLength(1);
  });

  it("does not add a chip twice", async () => {
    const onchange = vi.fn();
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple"],
      onchange,
    });
    await pick("Apple");
    expect(readChips(page.container)).toEqual(["Apple"]);
    expect(onchange).not.toHaveBeenCalled();
  });

  it("removes a chip on a click, without submitting the form", async () => {
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana"],
    });
    const form = page.container.querySelector("form") as HTMLFormElement;
    form.addEventListener("submit", onsubmit);
    await page.getByRole("button", { name: /Apple/ }).click();
    await expect.poll(() => readBound(page.container)).toEqual(["banana"]);
    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("moves from the input to the chips and removes them by keyboard", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana", "cherry"],
    });
    getInput().focus();
    await userEvent.keyboard("{Backspace}");
    await expect
      .poll(() => readBound(page.container))
      .toEqual(["apple", "banana"]);
    await userEvent.keyboard("{ArrowLeft}");
    const banana = page.getByRole("button", { name: /Banana/ }).element();
    await expect.poll(() => document.activeElement).toBe(banana);
    await userEvent.keyboard("{ArrowLeft}{Delete}");
    await expect.poll(() => readBound(page.container)).toEqual(["banana"]);
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.activeElement).toBe(getInput());
  });

  it("leaves ArrowLeft and Backspace to the text while the list is open", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple"],
    });
    getInput().focus();
    await userEvent.keyboard("{ArrowDown}{ArrowLeft}{Backspace}");
    expect(readBound(page.container)).toEqual(["apple"]);
    expect(document.activeElement).toBe(getInput());
    // A click on the open list's input closes it.
    await userEvent.click(getInput());
    await expect
      .poll(() => getInput().getAttribute("aria-expanded"))
      .toBe("false");
  });

  it("re-adds an option after its chip is removed", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: [],
    });
    await pick("Apple");
    await expect.poll(() => readChips(page.container)).toEqual(["Apple"]);
    await page.getByRole("button", { name: /Apple/ }).click();
    await expect.poll(() => readChips(page.container)).toEqual([]);
    await pick("Apple");
    await expect.poll(() => readChips(page.container)).toEqual(["Apple"]);
  });

  it("resets to [] and focuses the input", async () => {
    const onchange = vi.fn();
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana"],
      onchange,
    });
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect.poll(() => readChips(page.container)).toEqual([]);
    expect(onchange).toHaveBeenCalledExactlyOnceWith([]);
    expect(document.activeElement).toBe(getInput());
    expect(getInput().getAttribute("aria-expanded")).toBe("false");
  });

  it("opens the list on reset with openOnReset", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple"],
      openOnReset: true,
    });
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect
      .poll(() => getInput().getAttribute("aria-expanded"))
      .toBe("true");
  });

  it("clears the chips when the bound value becomes undefined", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple"],
    });
    expect(readChips(page.container)).toEqual(["Apple"]);
    await page.rerender({ value: undefined });
    await expect.poll(() => readChips(page.container)).toEqual([]);
  });

  it("keeps the chips when options change", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
    });
    await pick("Banana");
    // A parent passes its bound value back down as it renders new options.
    await page.rerender({
      options: [...fruits],
      value: readBound(page.container) as string[],
    });
    await expect.poll(() => readChips(page.container)).toEqual(["Banana"]);
  });
});

describe("ComboboxInput (multiple) under a Form owner", () => {
  const setUp = async () => {
    const owner = createFormState({
      defaultValues: { fruit: ["apple", "banana", "cherry"] },
    });
    const fields = [
      {
        inputType: "combobox" as const,
        name: "fruit",
        label: "Fruit",
        isMultiple: true,
        options: fruits,
      },
    ];
    const page = await render(OwnedForm, { owner, fields });
    return { owner, fields, page };
  };

  it("clears ALL selected chips and the owner's value on reset", async () => {
    const { owner, page } = await setUp();
    expect(readChips(page.container)).toEqual(["Apple", "Banana", "Cherry"]);
    expect(readPosted(page.container, "fruit")).toEqual([
      "apple",
      "banana",
      "cherry",
    ]);
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect.poll(() => readChips(page.container)).toEqual([]);
    // [] (not undefined), so the owner does not revert to its default.
    expect(owner.values.fruit).toEqual([]);
    expect(readPosted(page.container, "fruit")).toEqual([]);
  });

  it("stays cleared after a parent re-render", async () => {
    const { owner, fields, page } = await setUp();
    await page.getByRole("button", { name: "Clear selection" }).click();
    await page.rerender({ fields: fields.map((field) => ({ ...field })) });
    await settle();
    expect(readChips(page.container)).toEqual([]);
    expect(owner.values.fruit).toEqual([]);
  });

  it("writes picks and removals to the owner by name", async () => {
    const { owner, page } = await setUp();
    await page.getByRole("button", { name: /Banana/ }).click();
    await expect.poll(() => owner.values.fruit).toEqual(["apple", "cherry"]);
    await pick("Banana");
    await expect
      .poll(() => owner.values.fruit)
      .toEqual(["apple", "cherry", "banana"]);
  });
});

describe("ComboboxInput (multiple) posting without JavaScript", () => {
  it("posts one value per chip, not the visible input", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      name: "fruit",
      options: fruits,
      value: ["apple", "cherry"],
    });
    expect(readPosted(page.container, "fruit")).toEqual(["apple", "cherry"]);
    expect(getInput().hasAttribute("name")).toBe(false);
  });

  it("posts nothing for an empty value", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      name: "fruit",
      options: fruits,
      value: [],
    });
    expect(readPosted(page.container, "fruit")).toEqual([]);
  });

  it("posts the chips of an unbound multiple combobox", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      name: "fruit",
      options: fruits,
    });
    await pick("Banana");
    await pick("Apple");
    await expect
      .poll(() => readPosted(page.container, "fruit"))
      .toEqual(["banana", "apple"]);
  });

  it("renders no hidden input without a name", async () => {
    const page = await render(ComboboxInput, {
      isMultiple: true,
      options: fruits,
      value: ["apple"],
    });
    expect(page.container.querySelector('input[type="hidden"]')).toBeNull();
  });
});

describe("ComboboxInput asynchronous value lookup (multiple)", () => {
  it("shows the chips once every lookup answers", async () => {
    const lookups = {
      apple: deferred<Option | null>(),
      banana: deferred<Option | null>(),
    };
    const convertValueToItem = vi.fn(
      (value: string) => lookups[value as keyof typeof lookups].promise,
    );
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      name: "fruit",
      options: fruits,
      value: ["apple", "banana"],
      convertValueToItem,
    });
    expect(readChips(page.container)).toEqual([]);
    expect(readPosted(page.container, "fruit")).toEqual(["apple", "banana"]);

    lookups.banana.resolve(byValue("banana"));
    await settle();
    expect(readChips(page.container)).toEqual([]);
    lookups.apple.resolve(byValue("apple"));
    await expect
      .poll(() => readChips(page.container))
      .toEqual(["Apple", "Banana"]);
    expect(convertValueToItem).toHaveBeenCalledTimes(2);
  });

  it("drops a value the lookup cannot resolve", async () => {
    const page = await render(ComboboxInput, {
      isMultiple: true,
      options: fruits,
      value: ["apple", "durian"],
      convertValueToItem: async (value: string) => byValue(value),
    });
    await expect.poll(() => readChips(page.container)).toEqual(["Apple"]);
  });

  it("discards stale answers when the value changes mid-lookup", async () => {
    const lookups = {
      apple: deferred<Option | null>(),
      cherry: deferred<Option | null>(),
    };
    const convertValueToItem: ConvertValueToItem = (value) =>
      lookups[value as keyof typeof lookups].promise;
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple"],
      convertValueToItem,
    });
    await page.rerender({ value: ["cherry"] });

    lookups.cherry.resolve(byValue("cherry"));
    await expect.poll(() => readChips(page.container)).toEqual(["Cherry"]);
    lookups.apple.resolve(byValue("apple"));
    await settle();
    expect(readChips(page.container)).toEqual(["Cherry"]);
  });

  it("does not look up a value the user just picked", async () => {
    const convertValueToItem = vi.fn(async (value: string) => byValue(value));
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: [],
      convertValueToItem,
    });
    await pick("Banana");
    await expect.poll(() => readChips(page.container)).toEqual(["Banana"]);
    await settle();
    expect(convertValueToItem).not.toHaveBeenCalled();
  });

  it("looks the values up by a custom valueKey", async () => {
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      name: "fruit",
      options: fruits,
      valueKey: "label",
      value: ["Cherry"],
    });
    expect(readChips(page.container)).toEqual(["Cherry"]);
    expect(readPosted(page.container, "fruit")).toEqual(["Cherry"]);
    await pick("Apple");
    await expect
      .poll(() => readBound(page.container))
      .toEqual(["Cherry", "Apple"]);
  });

  it("drops only the chip whose lookup rejects", async () => {
    const convertValueToItem: ConvertValueToItem = async (value) => {
      if (value === "banana") throw new Error("down");
      return byValue(value);
    };
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      name: "fruit",
      options: fruits,
      value: ["apple", "banana", "cherry"],
      convertValueToItem,
    });
    await expect
      .poll(() => readChips(page.container))
      .toEqual(["Apple", "Cherry"]);
    expect(readPosted(page.container, "fruit")).toEqual([
      "apple",
      "banana",
      "cherry",
    ]);
  });

  it("adds a pick to the values still being looked up", async () => {
    const lookup = deferred<Option | null>();
    const onchange = vi.fn();
    await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple"],
      onchange,
      convertValueToItem: () => lookup.promise,
    });
    await pick("Banana");
    await expect
      .poll(() => onchange.mock.calls)
      .toEqual([[["apple", "banana"]]]);
    lookup.resolve(byValue("apple"));
  });

  it("does not look up an unresolved value again on a new lookup function", async () => {
    const calls: string[] = [];
    const lookUp = (value: string) => {
      calls.push(value);
      return Promise.resolve(value === "durian" ? null : byValue(value));
    };
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple", "durian"],
      convertValueToItem: (value: string) => lookUp(value),
    });
    await expect.poll(() => readChips(page.container)).toEqual(["Apple"]);
    await page.rerender({
      convertValueToItem: (value: string) => lookUp(value),
    });
    await settle();
    expect(readChips(page.container)).toEqual(["Apple"]);
    expect(calls).toEqual(["apple", "durian"]);

    // Once the value leaves the selection, it is looked up afresh.
    await page.rerender({ value: ["apple"] });
    await page.rerender({ value: ["apple", "durian"] });
    await expect.poll(() => calls).toEqual(["apple", "durian", "durian"]);
    await expect.poll(() => readChips(page.container)).toEqual(["Apple"]);
  });

  it("discards pending lookups when the combobox goes away", async () => {
    const lookup = deferred<Option | null>();
    const page = await render(ComboboxHarness, {
      isMultiple: true,
      options: fruits,
      value: ["apple"],
      convertValueToItem: () => lookup.promise,
    });
    page.unmount();
    lookup.resolve(byValue("apple"));
    await settle();
    expect(document.querySelector(".selected-items")).toBeNull();
  });
});
