import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Bound from "../../testing/Bound.fixtures.svelte";
import readBound from "../../testing/readBound.js";
import { CheckboxInput } from "./CheckboxInput/index.js";
import { RadioInput } from "./RadioInput/index.js";
import { SelectInput } from "./SelectInput/index.js";
import { SwitchInput } from "./SwitchInput/index.js";

const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B", lang: "fr" },
  { value: "c", label: "C", disabled: true },
];

describe("SelectInput", () => {
  it("binds the selected option", async () => {
    const page = await render(Bound, { of: SelectInput, options, value: "a" });
    await userEvent.selectOptions(page.getByRole("combobox"), "b");
    await expect.poll(() => readBound(page.container)).toBe("b");
    const option = page.container.querySelector('option[value="b"]');
    expect(option?.getAttribute("lang")).toBe("fr");
  });

  it("binds every selected option when multiple", async () => {
    const page = await render(Bound, {
      of: SelectInput,
      options,
      multiple: true,
      value: ["a"],
    });
    await userEvent.selectOptions(page.getByRole("listbox"), ["a", "b"]);
    await expect.poll(() => readBound(page.container)).toEqual(["a", "b"]);
  });
});

describe("SelectInput updates", () => {
  it.each([false, true])(
    "keeps the selection when options are relabelled (multiple: %s)",
    async (multiple) => {
      const onchange = vi.fn();
      const page = await render(SelectInput, {
        options,
        multiple,
        onchange,
        value: multiple ? ["b"] : "b",
      });
      const select = page.container.querySelector(
        "select",
      ) as HTMLSelectElement;
      await page.rerender({
        options: options.map((option) => ({
          ...option,
          label: `${option.label}!`,
        })),
        multiple,
        onchange,
        value: multiple ? ["b"] : "b",
      });
      expect(select.options[1].textContent).toBe("B!");
      expect(select.options[1].selected).toBe(true);
      await userEvent.selectOptions(select, "a");
      expect(onchange).toHaveBeenCalled();
    },
  );
});

describe("SelectInput without a value", () => {
  it("selects nothing in a multiple select", async () => {
    const page = await render(SelectInput, { options, multiple: true });
    const select = page.container.querySelector("select") as HTMLSelectElement;
    expect(select.selectedOptions).toHaveLength(0);
  });
});

describe.each([
  ["CheckboxInput", CheckboxInput, "checkbox"],
  ["SwitchInput", SwitchInput, "switch"],
] as const)("%s", (_name, component, role) => {
  it("binds its checked state", async () => {
    const page = await render(Bound, {
      of: component,
      binding: "checked",
      "aria-label": "Toggle",
      value: false,
    });
    (page.getByRole(role).element() as HTMLElement).click();
    await expect.poll(() => readBound(page.container)).toBe(true);
  });
});

describe("RadioInput", () => {
  it("reports its selection and calls the change handler", async () => {
    const onchange = vi.fn();
    const page = await render(Bound, {
      of: RadioInput,
      binding: "checked",
      "aria-label": "Pick",
      onchange,
      value: false,
    });
    (page.getByRole("radio").element() as HTMLElement).click();
    await expect.poll(() => readBound(page.container)).toBe(true);
    expect(onchange).toHaveBeenCalledOnce();
  });

  it("reports its selection without a change handler", async () => {
    const page = await render(Bound, {
      of: RadioInput,
      binding: "checked",
      "aria-label": "Pick",
    });
    (page.getByRole("radio").element() as HTMLElement).click();
    await expect.poll(() => readBound(page.container)).toBe(true);
  });
});
