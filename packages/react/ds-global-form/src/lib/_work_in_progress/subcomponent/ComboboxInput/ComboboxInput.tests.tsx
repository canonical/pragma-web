import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type React from "react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import type { Option } from "../../../subcomponent/types.js";
import { ComboboxField } from "../../component/ComboboxField/index.js";
import { ComboboxInput } from "./ComboboxInput.js";
import type { ConvertValueToItem } from "./types.js";

const fruits: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

/**
 * The visible selection is the set of chips (`button.chip` inside
 * `.selected-items`). Query them directly rather than by text — the dropdown
 * list also renders each option as `<li role="option">`, so a plain text query
 * would conflate a selected chip with an available option.
 */
const chipLabels = (container: HTMLElement): string[] =>
  Array.from(container.querySelectorAll(".selected-items .chip")).map((chip) =>
    (chip.textContent ?? "").replace("×", "").trim(),
  );

describe("ComboboxInput (presentational)", () => {
  it("renders an input", () => {
    render(<ComboboxInput options={fruits} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders chips for each value in multiple mode", () => {
    const { container } = render(
      <ComboboxInput
        isMultiple
        options={fruits}
        value={["apple", "banana", "cherry"]}
      />,
    );
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);
  });

  it("supports the disabled state", () => {
    render(<ComboboxInput options={fruits} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});

/**
 * A form harness that both renders the field and exposes the values captured on
 * submit, so a test can assert the react-hook-form state — not just the DOM.
 * The DOM alone is insufficient here: the reset bug was a re-sync effect
 * resurrecting cleared chips from a stale RHF value, so the field value is the
 * thing under test.
 */
function ComboboxFormHarness({
  onSubmit,
  extraButton,
}: {
  onSubmit: (values: Record<string, unknown>) => void;
  extraButton?: React.ReactNode;
}) {
  const methods = useForm({
    defaultValues: { fruit: ["apple", "banana", "cherry"] },
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ComboboxField
          name="fruit"
          label="Fruit"
          isMultiple
          isOptional
          options={fruits}
        />
        {extraButton}
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe("ComboboxField (multiple) reset", () => {
  it("clears ALL selected chips when the reset button is clicked", () => {
    const { container } = render(<ComboboxFormHarness onSubmit={() => {}} />);

    // All three defaultValues render as chips.
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

    // Not one, not the last — every chip is gone.
    expect(chipLabels(container)).toEqual([]);
  });

  it("clears the react-hook-form value (does not revert to defaultValues)", async () => {
    const onSubmit = vi.fn();
    const { container } = render(<ComboboxFormHarness onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    // Submit the form element directly — the fields carry no validation rules,
    // so the empty selection is valid and handleSubmit invokes the callback.
    const form = container.querySelector("form");
    if (!form) throw new Error("form not rendered");
    fireEvent.submit(form);

    // react-hook-form's handleSubmit resolves asynchronously.
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    // Emitting [] (not undefined) is what stops RHF falling back to the
    // defaultValue array and resurrecting the chips on the next render.
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ fruit: [] });
  });

  it("stays cleared after a parent re-render (the effect cannot resurrect it)", async () => {
    // A parent re-render re-runs the value→selectedItems sync effect. With the
    // old write-only effect + onChange(undefined), that re-supplied the default
    // array and repopulated the chips. Assert on the form value, not just the
    // DOM: in jsdom the synchronous setSelectedItems([]) clears the chips even
    // on the buggy code, so the resurrection only shows through the RHF value.
    const onSubmit = vi.fn();
    function Wrapper() {
      const [, forceRender] = useState(0);
      return (
        <ComboboxFormHarness
          onSubmit={onSubmit}
          extraButton={
            <button type="button" onClick={() => forceRender((n) => n + 1)}>
              Re-render
            </button>
          }
        />
      );
    }
    const { container } = render(<Wrapper />);

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    fireEvent.click(screen.getByRole("button", { name: "Re-render" }));

    expect(chipLabels(container)).toEqual([]);

    const form = container.querySelector("form");
    if (!form) throw new Error("form not rendered");
    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ fruit: [] });
  });
});

describe("ComboboxInput (multiple) re-selection", () => {
  it("re-adds an option after its chip is removed", () => {
    // Regression: useCombobox kept the last pick as its internal selectedItem,
    // so choosing that same option again was not a change and never fired —
    // the removed option could not be added back.
    function Controlled() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <ComboboxInput
          isMultiple
          options={fruits}
          value={value}
          onChange={(next) => setValue(next as string[])}
        />
      );
    }
    const { container } = render(<Controlled />);
    const input = screen.getByRole("combobox");
    // The menu is a `popover`, which jsdom reports as hidden — hence `hidden`.
    const pick = (label: string) => {
      fireEvent.click(input);
      fireEvent.click(
        screen.getByRole("option", { name: label, hidden: true }),
      );
    };

    pick("Apple");
    expect(chipLabels(container)).toEqual(["Apple"]);

    const chip = container.querySelector(".selected-items .chip");
    if (!chip) throw new Error("chip not rendered");
    fireEvent.click(chip);
    expect(chipLabels(container)).toEqual([]);

    pick("Apple");
    expect(chipLabels(container)).toEqual(["Apple"]);
  });
});

/** The values a native submission of the rendered form would post. */
const postedValues = (container: HTMLElement, name: string): string[] => {
  const form = container.querySelector("form");
  if (!form) throw new Error("form not rendered");
  return new FormData(form).getAll(name).map(String);
};

/** Picks an option from the open list (a popover, hidden to jsdom). */
const pick = (label: string) => {
  fireEvent.click(screen.getByRole("combobox"));
  fireEvent.click(screen.getByRole("option", { name: label, hidden: true }));
};

describe("ComboboxInput posting without JavaScript", () => {
  it("posts the single value through a hidden input, not the visible one", () => {
    const { container } = render(
      <form>
        <ComboboxInput name="fruit" options={fruits} value="banana" />
      </form>,
    );
    expect(postedValues(container, "fruit")).toEqual(["banana"]);
    expect(screen.getByRole("combobox")).not.toHaveAttribute("name");
  });

  it("posts nothing for an empty single value", () => {
    const { container } = render(
      <form>
        <ComboboxInput name="fruit" options={fruits} />
      </form>,
    );
    expect(postedValues(container, "fruit")).toEqual([]);
  });

  it("posts the selection of an uncontrolled single combobox", () => {
    const { container } = render(
      <form>
        <ComboboxInput name="fruit" options={fruits} />
      </form>,
    );
    pick("Cherry");
    expect(postedValues(container, "fruit")).toEqual(["cherry"]);
  });

  it("posts one value per chip in multiple mode", () => {
    const { container } = render(
      <form>
        <ComboboxInput
          isMultiple
          name="fruit"
          options={fruits}
          value={["apple", "cherry"]}
        />
      </form>,
    );
    expect(postedValues(container, "fruit")).toEqual(["apple", "cherry"]);
    expect(screen.getByRole("combobox")).not.toHaveAttribute("name");
  });

  it("posts nothing for an empty multiple value", () => {
    const { container } = render(
      <form>
        <ComboboxInput isMultiple name="fruit" options={fruits} value={[]} />
      </form>,
    );
    expect(postedValues(container, "fruit")).toEqual([]);
  });

  it("posts the chips of an uncontrolled multiple combobox", () => {
    const { container } = render(
      <form>
        <ComboboxInput isMultiple name="fruit" options={fruits} />
      </form>,
    );
    pick("Banana");
    pick("Apple");
    expect(postedValues(container, "fruit")).toEqual(["banana", "apple"]);
  });

  it("renders no hidden input without a name", () => {
    const { container } = render(
      <>
        <ComboboxInput options={fruits} value="apple" />
        <ComboboxInput isMultiple options={fruits} value={["apple"]} />
      </>,
    );
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it("posts the form value of a bound field", () => {
    function Harness() {
      const methods = useForm({ defaultValues: { fruit: ["banana"] } });
      return (
        <FormProvider {...methods}>
          <form>
            <ComboboxField
              name="fruit"
              label="Fruit"
              isMultiple
              isOptional
              options={fruits}
            />
          </form>
        </FormProvider>
      );
    }
    const { container } = render(<Harness />);
    expect(postedValues(container, "fruit")).toEqual(["banana"]);
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(postedValues(container, "fruit")).toEqual([]);
  });
});

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

describe("ComboboxInput asynchronous value lookup (single)", () => {
  it("shows nothing as selected until the lookup answers", async () => {
    const lookup = deferred<Option | null>();
    const convertValueToItem = vi.fn(() => lookup.promise);
    const { container } = render(
      <form>
        <ComboboxInput
          name="fruit"
          options={fruits}
          value="banana"
          convertValueToItem={convertValueToItem}
        />
      </form>,
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("");
    // The hidden input carries the value while the lookup is pending.
    expect(postedValues(container, "fruit")).toEqual(["banana"]);

    await act(async () => lookup.resolve(byValue("banana")));
    expect(input).toHaveValue("Banana");
    // The first value is looked up once, not again by the mount effect.
    expect(convertValueToItem).toHaveBeenCalledTimes(1);
  });

  it("discards a stale answer when the value changes mid-lookup", async () => {
    const lookups = {
      apple: deferred<Option | null>(),
      cherry: deferred<Option | null>(),
    };
    const convertValueToItem: ConvertValueToItem = (value) =>
      lookups[value as keyof typeof lookups].promise;
    const { rerender } = render(
      <ComboboxInput
        options={fruits}
        value="apple"
        convertValueToItem={convertValueToItem}
      />,
    );
    rerender(
      <ComboboxInput
        options={fruits}
        value="cherry"
        convertValueToItem={convertValueToItem}
      />,
    );
    const input = screen.getByRole("combobox");

    await act(async () => lookups.cherry.resolve(byValue("cherry")));
    expect(input).toHaveValue("Cherry");
    await act(async () => lookups.apple.resolve(byValue("apple")));
    expect(input).toHaveValue("Cherry");
  });

  it("does not look up a value the user just picked", async () => {
    const convertValueToItem = vi.fn(async (value: string) => byValue(value));
    function Controlled() {
      const [value, setValue] = useState<string | string[] | undefined>();
      return (
        <ComboboxInput
          options={fruits}
          value={value}
          onChange={setValue}
          convertValueToItem={convertValueToItem}
        />
      );
    }
    render(<Controlled />);
    pick("Apple");
    expect(screen.getByRole("combobox")).toHaveValue("Apple");
    expect(convertValueToItem).not.toHaveBeenCalled();
  });

  it("looks the value up by a custom valueKey", async () => {
    const convertValueToItem = vi.fn(
      (value: string, items: Option[], valueKey: keyof Option) =>
        items.find((item) => item[valueKey] === value) ?? null,
    );
    const onChange = vi.fn();
    const { rerender } = render(
      <ComboboxInput
        options={fruits}
        value="Banana"
        valueKey="label"
        onChange={onChange}
        convertValueToItem={convertValueToItem}
      />,
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("Banana");
    expect(convertValueToItem).toHaveBeenCalledWith("Banana", fruits, "label");

    rerender(
      <ComboboxInput
        options={fruits}
        value="Cherry"
        valueKey="label"
        onChange={onChange}
        convertValueToItem={convertValueToItem}
      />,
    );
    await waitFor(() => expect(input).toHaveValue("Cherry"));
    // Reflecting the controlled value is not a change to report.
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears the selection without a lookup when the value empties", () => {
    const convertValueToItem = vi.fn((value: string) => byValue(value));
    const { rerender } = render(
      <ComboboxInput
        options={fruits}
        value="apple"
        convertValueToItem={convertValueToItem}
      />,
    );
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("Apple");
    rerender(
      <ComboboxInput
        options={fruits}
        value={undefined}
        convertValueToItem={convertValueToItem}
      />,
    );
    expect(input).toHaveValue("");
    expect(convertValueToItem).toHaveBeenCalledTimes(1);
  });

  it("resolves a custom valueKey with the default lookup", () => {
    render(<ComboboxInput options={fruits} value="Cherry" valueKey="label" />);
    expect(screen.getByRole("combobox")).toHaveValue("Cherry");
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
    const { container } = render(
      <form>
        <ComboboxInput
          isMultiple
          name="fruit"
          options={fruits}
          value={["apple", "banana"]}
          convertValueToItem={convertValueToItem}
        />
      </form>,
    );
    expect(chipLabels(container)).toEqual([]);
    expect(postedValues(container, "fruit")).toEqual(["apple", "banana"]);

    await act(async () => lookups.banana.resolve(byValue("banana")));
    expect(chipLabels(container)).toEqual([]);
    await act(async () => lookups.apple.resolve(byValue("apple")));
    expect(chipLabels(container)).toEqual(["Apple", "Banana"]);
    expect(convertValueToItem).toHaveBeenCalledTimes(2);
  });

  it("drops a value the lookup cannot resolve", async () => {
    const { container } = render(
      <ComboboxInput
        isMultiple
        options={fruits}
        value={["apple", "durian"]}
        convertValueToItem={async (value) => byValue(value)}
      />,
    );
    await waitFor(() => expect(chipLabels(container)).toEqual(["Apple"]));
  });

  it("discards stale answers when the value changes mid-lookup", async () => {
    const lookups = {
      apple: deferred<Option | null>(),
      cherry: deferred<Option | null>(),
    };
    const convertValueToItem: ConvertValueToItem = (value) =>
      lookups[value as keyof typeof lookups].promise;
    const { container, rerender } = render(
      <ComboboxInput
        isMultiple
        options={fruits}
        value={["apple"]}
        convertValueToItem={convertValueToItem}
      />,
    );
    rerender(
      <ComboboxInput
        isMultiple
        options={fruits}
        value={["cherry"]}
        convertValueToItem={convertValueToItem}
      />,
    );

    await act(async () => lookups.cherry.resolve(byValue("cherry")));
    expect(chipLabels(container)).toEqual(["Cherry"]);
    await act(async () => lookups.apple.resolve(byValue("apple")));
    expect(chipLabels(container)).toEqual(["Cherry"]);
  });

  it("does not look up a value the user just picked", async () => {
    const convertValueToItem = vi.fn(async (value: string) => byValue(value));
    function Controlled() {
      const [value, setValue] = useState<string | string[] | undefined>([]);
      return (
        <ComboboxInput
          isMultiple
          options={fruits}
          value={value}
          onChange={setValue}
          convertValueToItem={convertValueToItem}
        />
      );
    }
    const { container } = render(<Controlled />);
    pick("Banana");
    expect(chipLabels(container)).toEqual(["Banana"]);
    expect(convertValueToItem).not.toHaveBeenCalled();
  });

  it("looks the values up by a custom valueKey", () => {
    const { container } = render(
      <form>
        <ComboboxInput
          isMultiple
          name="fruit"
          options={fruits}
          valueKey="label"
          value={["Cherry"]}
        />
      </form>,
    );
    expect(chipLabels(container)).toEqual(["Cherry"]);
    expect(postedValues(container, "fruit")).toEqual(["Cherry"]);
  });
});

describe("ComboboxInput selection behaviour", () => {
  it("clears a single selection on reset and reports it once", () => {
    const onChange = vi.fn();
    render(
      <ComboboxInput options={fruits} value="apple" onChange={onChange} />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("opens the list on reset with openOnReset", () => {
    render(<ComboboxInput options={fruits} value="apple" openOnReset />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("reports an option with an empty value as no value", () => {
    const onChange = vi.fn();
    render(
      <ComboboxInput
        options={[{ value: "", label: "None" }, ...fruits]}
        onChange={onChange}
      />,
    );
    pick("None");
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("shows nothing for a value the default lookup cannot find", () => {
    render(<ComboboxInput options={fruits} value="durian" />);
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("does not add a chip twice", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ComboboxInput
        isMultiple
        options={fruits}
        value={["apple"]}
        onChange={onChange}
      />,
    );
    pick("Apple");
    expect(chipLabels(container)).toEqual(["Apple"]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "filters the list through onInputValueChangeFactory (multiple: %s)",
    (isMultiple) => {
      render(
        <ComboboxInput
          isMultiple={isMultiple}
          options={fruits}
          onInputValueChangeFactory={(setItems) => () =>
            setItems([{ value: "remote", label: "Remote" }])
          }
        />,
      );
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "re" },
      });
      expect(
        screen
          .getAllByRole("option", { hidden: true })
          .map((o) => o.textContent),
      ).toEqual(["Remote"]);
    },
  );
});

describe("ComboboxInput rejected value lookup", () => {
  it("treats a rejected single lookup as not found", async () => {
    const convertValueToItem = vi.fn(() => Promise.reject(new Error("down")));
    const { container } = render(
      <form>
        <ComboboxInput
          name="fruit"
          options={fruits}
          value="banana"
          convertValueToItem={convertValueToItem}
        />
      </form>,
    );
    await act(async () => {});
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(postedValues(container, "fruit")).toEqual(["banana"]);
  });

  it("treats a rejected single lookup after a change as not found", async () => {
    const convertValueToItem: ConvertValueToItem = (value) =>
      value === "apple" ? byValue(value) : Promise.reject(new Error("down"));
    const { container, rerender } = render(
      <form>
        <ComboboxInput
          name="fruit"
          options={fruits}
          value="apple"
          convertValueToItem={convertValueToItem}
        />
      </form>,
    );
    expect(screen.getByRole("combobox")).toHaveValue("Apple");
    rerender(
      <form>
        <ComboboxInput
          name="fruit"
          options={fruits}
          value="cherry"
          convertValueToItem={convertValueToItem}
        />
      </form>,
    );
    await act(async () => {});
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(postedValues(container, "fruit")).toEqual(["cherry"]);
  });

  it("drops only the chip whose lookup rejects", async () => {
    const convertValueToItem: ConvertValueToItem = async (value) => {
      if (value === "banana") throw new Error("down");
      return byValue(value);
    };
    const { container } = render(
      <form>
        <ComboboxInput
          isMultiple
          name="fruit"
          options={fruits}
          value={["apple", "banana", "cherry"]}
          convertValueToItem={convertValueToItem}
        />
      </form>,
    );
    await waitFor(() =>
      expect(chipLabels(container)).toEqual(["Apple", "Cherry"]),
    );
    expect(postedValues(container, "fruit")).toEqual([
      "apple",
      "banana",
      "cherry",
    ]);
  });
});

describe("ComboboxInput multiple mode while lookups are pending", () => {
  it("adds a pick to the values still being looked up", async () => {
    const lookup = deferred<Option | null>();
    const onChange = vi.fn();
    render(
      <ComboboxInput
        isMultiple
        options={fruits}
        value={["apple"]}
        onChange={onChange}
        convertValueToItem={() => lookup.promise}
      />,
    );
    pick("Banana");
    expect(onChange).toHaveBeenCalledWith(["apple", "banana"]);
    await act(async () => lookup.resolve(byValue("apple")));
  });

  it("does not look up an unresolved value again on a new lookup function", async () => {
    const calls: string[] = [];
    const lookUp = (value: string) => {
      calls.push(value);
      return Promise.resolve(value === "durian" ? null : byValue(value));
    };
    const renderWith = (value: string[]) => (
      <ComboboxInput
        isMultiple
        options={fruits}
        value={value}
        convertValueToItem={(val) => lookUp(val)}
      />
    );
    const { container, rerender } = render(renderWith(["apple", "durian"]));
    await waitFor(() => expect(chipLabels(container)).toEqual(["Apple"]));
    rerender(renderWith(["apple", "durian"]));
    expect(chipLabels(container)).toEqual(["Apple"]);
    expect(calls).toEqual(["apple", "durian"]);

    // Once the value leaves the selection, it is looked up afresh.
    rerender(renderWith(["apple"]));
    rerender(renderWith(["apple", "durian"]));
    await waitFor(() => expect(chipLabels(container)).toEqual(["Apple"]));
    expect(calls).toEqual(["apple", "durian", "durian"]);
  });

  it("clears the chips when a controlled value becomes undefined", () => {
    const { container, rerender } = render(
      <ComboboxInput isMultiple options={fruits} value={["apple"]} />,
    );
    expect(chipLabels(container)).toEqual(["Apple"]);
    rerender(<ComboboxInput isMultiple options={fruits} value={undefined} />);
    expect(chipLabels(container)).toEqual([]);
  });

  it("keeps the chips of an uncontrolled combobox when options change", () => {
    const { container, rerender } = render(
      <ComboboxInput isMultiple options={fruits} />,
    );
    pick("Banana");
    rerender(<ComboboxInput isMultiple options={[...fruits]} />);
    expect(chipLabels(container)).toEqual(["Banana"]);
  });
});
