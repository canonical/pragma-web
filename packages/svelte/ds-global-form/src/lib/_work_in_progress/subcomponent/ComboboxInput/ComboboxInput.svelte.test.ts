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

/** The values a native submission of the rendered form would post. */
const readPosted = (container: HTMLElement, name: string): string[] =>
  new FormData(container.querySelector("form") as HTMLFormElement)
    .getAll(name)
    .map(String);

const getInput = () =>
  browserPage.getByRole("combobox").element() as HTMLInputElement;

/** Picks an option from the open list. */
const pick = async (label: string) => {
  await userEvent.click(getInput());
  await browserPage.getByRole("option", { name: label }).click();
};

/** The labels of the listed options. */
const readListed = (container: HTMLElement) =>
  [...container.querySelectorAll("li")].map((item) => item.textContent);

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

describe("ComboboxInput (presentational)", () => {
  it("renders an input", async () => {
    const page = await render(ComboboxInput, { options: fruits });
    await expect.element(page.getByRole("combobox")).toBeInTheDocument();
  });

  it("supports the disabled state", async () => {
    const page = await render(ComboboxInput, {
      options: fruits,
      disabled: true,
    });
    await expect.element(page.getByRole("combobox")).toBeDisabled();
  });

  it("calls onblur when the input loses focus", async () => {
    const onblur = vi.fn();
    await render(ComboboxHarness, { options: fruits, onblur });
    getInput().focus();
    await userEvent.tab();
    expect(onblur).toHaveBeenCalledOnce();
  });

  it("shows the list in a popover while open", async () => {
    const page = await render(ComboboxInput, { options: fruits });
    const list = page.container.querySelector("ul") as HTMLElement;
    expect(list.matches(":popover-open")).toBe(false);
    await userEvent.click(getInput());
    await expect.poll(() => list.matches(":popover-open")).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => list.matches(":popover-open")).toBe(false);
  });

  it("survives a browser without the popover API", async () => {
    const show = HTMLElement.prototype.showPopover;
    // @ts-expect-error simulating a browser without the popover API
    HTMLElement.prototype.showPopover = undefined;
    try {
      const page = await render(ComboboxInput, { options: fruits });
      await userEvent.click(getInput());
      await expect
        .poll(() => getInput().getAttribute("aria-expanded"))
        .toBe("true");
      expect(page.container.querySelector("ul")).not.toBeNull();
    } finally {
      HTMLElement.prototype.showPopover = show;
    }
  });
});

describe("ComboboxInput posting without JavaScript", () => {
  it("posts the single value through a hidden input, not the visible one", async () => {
    const page = await render(ComboboxHarness, {
      name: "fruit",
      options: fruits,
      value: "banana",
    });
    expect(readPosted(page.container, "fruit")).toEqual(["banana"]);
    expect(getInput().hasAttribute("name")).toBe(false);
  });

  it("posts nothing for an empty single value", async () => {
    const page = await render(ComboboxHarness, {
      name: "fruit",
      options: fruits,
    });
    expect(readPosted(page.container, "fruit")).toEqual([]);
  });

  it("posts the selection of an unbound single combobox", async () => {
    const page = await render(ComboboxHarness, {
      name: "fruit",
      options: fruits,
    });
    await pick("Cherry");
    await expect
      .poll(() => readPosted(page.container, "fruit"))
      .toEqual(["cherry"]);
  });

  it("renders no hidden input without a name", async () => {
    const page = await render(ComboboxInput, {
      options: fruits,
      value: "apple",
    });
    expect(page.container.querySelector('input[type="hidden"]')).toBeNull();
  });
});

describe("ComboboxInput asynchronous value lookup (single)", () => {
  it("shows nothing as selected until the lookup answers", async () => {
    const lookup = deferred<Option | null>();
    const convertValueToItem = vi.fn(() => lookup.promise);
    const page = await render(ComboboxHarness, {
      name: "fruit",
      options: fruits,
      value: "banana",
      convertValueToItem,
    });
    expect(getInput().value).toBe("");
    // The hidden input carries the value while the lookup is pending.
    expect(readPosted(page.container, "fruit")).toEqual(["banana"]);

    lookup.resolve(byValue("banana"));
    await expect.poll(() => getInput().value).toBe("Banana");
    // The first value is looked up once, not again once mounted.
    expect(convertValueToItem).toHaveBeenCalledTimes(1);
  });

  it("discards a stale answer when the value changes mid-lookup", async () => {
    const lookups = {
      apple: deferred<Option | null>(),
      cherry: deferred<Option | null>(),
    };
    const convertValueToItem: ConvertValueToItem = (value) =>
      lookups[value as keyof typeof lookups].promise;
    const page = await render(ComboboxHarness, {
      options: fruits,
      value: "apple",
      convertValueToItem,
    });
    await page.rerender({ value: "cherry" });

    lookups.cherry.resolve(byValue("cherry"));
    await expect.poll(() => getInput().value).toBe("Cherry");
    lookups.apple.resolve(byValue("apple"));
    await new Promise((settle) => setTimeout(settle));
    expect(getInput().value).toBe("Cherry");
  });

  it("does not look up a value the user just picked", async () => {
    const convertValueToItem = vi.fn(async (value: string) => byValue(value));
    await render(ComboboxHarness, { options: fruits, convertValueToItem });
    await pick("Apple");
    await expect.poll(() => getInput().value).toBe("Apple");
    await new Promise((settle) => setTimeout(settle));
    expect(convertValueToItem).not.toHaveBeenCalled();
  });

  it("looks the value up by a custom valueKey", async () => {
    const convertValueToItem = vi.fn(
      (value: string, items: readonly Option[], valueKey: keyof Option) =>
        items.find((item) => item[valueKey] === value) ?? null,
    );
    const onchange = vi.fn();
    const page = await render(ComboboxHarness, {
      options: fruits,
      value: "Banana",
      valueKey: "label",
      onchange,
      convertValueToItem,
    });
    expect(getInput().value).toBe("Banana");
    expect(convertValueToItem).toHaveBeenCalledWith("Banana", fruits, "label");

    await page.rerender({ value: "Cherry" });
    await expect.poll(() => getInput().value).toBe("Cherry");
    // Reflecting the bound value is not a change to report.
    expect(onchange).not.toHaveBeenCalled();
  });

  it("clears the selection without a lookup when the value empties", async () => {
    const convertValueToItem = vi.fn((value: string) => byValue(value));
    const page = await render(ComboboxHarness, {
      options: fruits,
      value: "apple",
      convertValueToItem,
    });
    expect(getInput().value).toBe("Apple");
    await page.rerender({ value: undefined });
    await expect.poll(() => getInput().value).toBe("");
    expect(convertValueToItem).toHaveBeenCalledTimes(1);
  });

  it("resolves a custom valueKey with the default lookup", async () => {
    await render(ComboboxInput, {
      options: fruits,
      value: "Cherry",
      valueKey: "label",
    });
    expect(getInput().value).toBe("Cherry");
  });
});

describe("ComboboxInput rejected value lookup", () => {
  it("treats a rejected single lookup as not found", async () => {
    const convertValueToItem = vi.fn(() => Promise.reject(new Error("down")));
    const page = await render(ComboboxHarness, {
      name: "fruit",
      options: fruits,
      value: "banana",
      convertValueToItem,
    });
    await new Promise((settle) => setTimeout(settle));
    expect(getInput().value).toBe("");
    expect(readPosted(page.container, "fruit")).toEqual(["banana"]);
  });

  it("treats a rejected single lookup after a change as not found", async () => {
    const convertValueToItem: ConvertValueToItem = (value) =>
      value === "apple" ? byValue(value) : Promise.reject(new Error("down"));
    const page = await render(ComboboxHarness, {
      name: "fruit",
      options: fruits,
      value: "apple",
      convertValueToItem,
    });
    expect(getInput().value).toBe("Apple");
    await page.rerender({ value: "cherry" });
    await expect.poll(() => getInput().value).toBe("");
    await new Promise((settle) => setTimeout(settle));
    expect(getInput().value).toBe("");
    expect(readPosted(page.container, "fruit")).toEqual(["cherry"]);
  });
});

describe("ComboboxInput selection behaviour", () => {
  it("clears a single selection on reset and reports it once", async () => {
    const onchange = vi.fn();
    const page = await render(ComboboxHarness, {
      options: fruits,
      value: "apple",
      onchange,
    });
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect.poll(() => getInput().value).toBe("");
    expect(document.activeElement).toBe(getInput());
    expect(onchange).toHaveBeenCalledExactlyOnceWith(undefined);
    expect(getInput().getAttribute("aria-expanded")).toBe("false");
  });

  it("opens the list on reset with openOnReset", async () => {
    const page = await render(ComboboxHarness, {
      options: fruits,
      value: "apple",
      openOnReset: true,
    });
    expect(getInput().getAttribute("aria-expanded")).toBe("false");
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect
      .poll(() => getInput().getAttribute("aria-expanded"))
      .toBe("true");
  });

  it("reports an option with an empty value as no value", async () => {
    const onchange = vi.fn();
    await render(ComboboxHarness, {
      options: [{ value: "", label: "None" }, ...fruits],
      onchange,
    });
    await pick("None");
    await expect.poll(() => onchange.mock.calls).toEqual([[undefined]]);
  });

  it("shows nothing for a value the default lookup cannot find", async () => {
    await render(ComboboxInput, { options: fruits, value: "durian" });
    expect(getInput().value).toBe("");
  });

  it("binds the picked value and marks its option selected", async () => {
    const page = await render(ComboboxHarness, { options: fruits });
    await pick("Banana");
    await expect.poll(() => readBound(page.container)).toBe("banana");
    // Picking fills the text, so the list now shows only the pick.
    const listed = page.container.querySelectorAll("li");
    expect(listed).toHaveLength(1);
    expect(listed[0].className).toBe("p selected");
  });

  it("clears the bound value with Escape on a closed list", async () => {
    const page = await render(ComboboxHarness, {
      options: fruits,
      value: "banana",
    });
    getInput().focus();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => readBound(page.container)).toBeNull();
  });
});

describe("ComboboxInput filtering", () => {
  it("lists every option until the text first changes, then filters", async () => {
    const page = await render(ComboboxHarness, {
      options: fruits,
      value: "banana",
    });
    expect(readListed(page.container)).toEqual(["Apple", "Banana", "Cherry"]);
    getInput().focus();
    await userEvent.keyboard(
      "{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}",
    );
    await expect.poll(() => readListed(page.container)).toEqual(["Banana"]);
    await userEvent.keyboard("{Backspace}");
    await expect
      .poll(() => readListed(page.container))
      .toEqual(["Apple", "Banana", "Cherry"]);
    await userEvent.keyboard("e");
    await expect
      .poll(() => readListed(page.container))
      .toEqual(["Apple", "Cherry"]);
  });

  it("filters with a custom filterItems and binds the text", async () => {
    const page = await render(ComboboxHarness, {
      options: fruits,
      filterItems: (options: readonly Option[], text: string) =>
        options.filter((option) => option.value.startsWith(text)),
    });
    await userEvent.type(getInput(), "ch");
    await expect.poll(() => readListed(page.container)).toEqual(["Cherry"]);
    expect(page.getByTestId("text").element().textContent).toBe("ch");
  });

  it("follows options the app recomputes from the text", async () => {
    const page = await render(ComboboxHarness, { options: fruits });
    await userEvent.type(getInput(), "re");
    await expect.poll(() => readListed(page.container)).toEqual([]);
    await page.rerender({ options: [{ value: "remote", label: "Remote" }] });
    await expect.poll(() => readListed(page.container)).toEqual(["Remote"]);
  });
});

describe("ComboboxField under a Form owner", () => {
  it("reads and writes the owner's value by name", async () => {
    const owner = createFormState({ defaultValues: { fruit: "banana" } });
    const page = await render(OwnedForm, {
      owner,
      fields: [
        {
          inputType: "combobox",
          name: "fruit",
          label: "Fruit",
          options: fruits,
        },
      ],
    });
    expect(getInput().value).toBe("Banana");
    expect(readPosted(page.container, "fruit")).toEqual(["banana"]);
    await pick("Cherry");
    await expect.poll(() => owner.values.fruit).toBe("cherry");
    expect(readPosted(page.container, "fruit")).toEqual(["cherry"]);
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect.poll(() => owner.values.fruit).toBeUndefined();
    expect(readPosted(page.container, "fruit")).toEqual([]);
  });
});
