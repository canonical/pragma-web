import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Bound from "../../testing/Bound.fixtures.svelte";
import readBound from "../../testing/readBound.js";
import { Form } from "../pattern/Form/index.js";
import { CheckboxField } from "./CheckboxField/index.js";
import { Choices } from "./ChoicesField/index.js";
import { DateTimeField } from "./DateTimeField/index.js";
import { HiddenField } from "./HiddenField/index.js";
import { RangeField } from "./RangeField/index.js";
import { RichChoices } from "./RichChoicesField/index.js";
import { SwitchField } from "./SwitchField/index.js";
import { TextField } from "./TextField/index.js";

const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C", disabled: true },
];
const card = createRawSnippet(() => ({
  render: () => "<strong>Card</strong>",
}));

describe("stacked field chrome", () => {
  it("wires the label, description, control and error", async () => {
    const page = await render(TextField, {
      id: "root",
      class: "extra",
      style: "color: red",
      name: "email",
      label: "Email",
      description: "Work address",
      error: "Email is required",
      placeholder: "you@example.com",
    });
    const field = page.container.querySelector(".ds.field") as HTMLElement;
    expect(field.id).toBe("root");
    expect(field.className).toBe("ds field extra danger");
    const input = page.container.querySelector("input") as HTMLInputElement;
    const control = input;
    expect(page.container.querySelector(".ds.input.text")?.id).toBe("");
    expect(page.container.querySelector("label")?.getAttribute("for")).toBe(
      input.id,
    );
    expect(input.placeholder).toBe("you@example.com");
    expect(input.required).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(
      `${control.id}-description ${control.id}-error`,
    );
    expect(
      page.container.querySelector(".payload > p.ds.field-error")?.textContent,
    ).toBe("Email is required");
  });

  it("labels an optional field by name and puts the description after the control", async () => {
    const page = await render(DateTimeField, {
      name: "when",
      description: "Local",
      isOptional: true,
    });
    expect(page.container.querySelector("label")?.textContent).toBe("when");
    const input = page.container.querySelector("input") as HTMLInputElement;
    expect(input.required).toBe(false);
    expect(input.getAttribute("aria-describedby")).toBe(
      `${input.id}-description`,
    );
    const payload = page.container.querySelector(".payload") as HTMLElement;
    expect(payload.lastElementChild?.className).toBe("ds field-description");
  });

  it("renders nothing while its condition fails", async () => {
    const page = await render(TextField, { name: "x", condition: () => false });
    expect(page.container.querySelector(".ds.field")).toBeNull();
  });
});

describe("toggle field chrome", () => {
  it("binds the checked state and shows a heading with a control label", async () => {
    const page = await render(Bound, {
      of: CheckboxField,
      name: "terms",
      label: "Terms",
      controlLabel: "I accept",
      description: "Read them",
      error: "Required",
      value: false,
    });
    expect(
      page.container.querySelector("span.field-toggle-heading")?.textContent,
    ).toBe("Terms");
    (
      page.getByRole("checkbox", { name: /I accept/ }).element() as HTMLElement
    ).click();
    await expect.poll(() => readBound(page.container)).toBe(true);
    expect(page.container.querySelector(".ds.field-error")?.textContent).toBe(
      "Required",
    );
    expect(page.container.querySelector("input")?.required).toBe(false);
  });

  it("puts a switch label before the control and falls back to the name", async () => {
    const page = await render(SwitchField, { name: "dark" } as never);
    expect(
      page.container.querySelector(".field-toggle-control.label-before"),
    ).not.toBeNull();
    expect(page.container.querySelector("label")?.textContent).toBe("dark");
  });

  it("renders nothing while its condition fails", async () => {
    const page = await render(CheckboxField, {
      name: "x",
      label: "X",
      condition: () => false,
    });
    expect(page.container.querySelector(".ds.field")).toBeNull();
  });
});

describe("Choices", () => {
  it("binds one radio value", async () => {
    const page = await render(Bound, {
      of: Choices,
      name: "size",
      options,
      value: "a",
    });
    (page.getByRole("radio", { name: "B" }).element() as HTMLElement).click();
    await expect.poll(() => readBound(page.container)).toBe("b");
    expect(page.getByRole("radio", { name: "C" }).element()).toBeDisabled();
  });

  it("binds checkbox values in a column layout", async () => {
    const page = await render(Bound, {
      of: Choices,
      name: "size",
      options,
      isMultiple: true,
      layout: "columns",
      columns: 2,
      style: "margin: 0",
    });
    (
      page.getByRole("checkbox", { name: "A" }).element() as HTMLElement
    ).click();
    (
      page.getByRole("checkbox", { name: "B" }).element() as HTMLElement
    ).click();
    (
      page.getByRole("checkbox", { name: "A" }).element() as HTMLElement
    ).click();
    await expect.poll(() => readBound(page.container)).toEqual(["b"]);
    const style = page.container.querySelector("fieldset")?.style;
    expect(style?.getPropertyValue("--choices-columns").trim()).toBe("2");
    expect(style?.margin).toBe("0px");
  });

  it("disables every option of a disabled group", async () => {
    const page = await render(Choices, {
      name: "size",
      options,
      disabled: true,
      layout: "columns",
    });
    expect(page.container.querySelectorAll(".ds.option.disabled")).toHaveLength(
      3,
    );
    expect(
      page.container.querySelector("fieldset")?.hasAttribute("style"),
    ).toBe(false);
  });
});

describe("RichChoices", () => {
  it("binds radio and checkbox values with snippet labels", async () => {
    const single = await render(Bound, {
      of: RichChoices,
      name: "plan",
      options: [{ value: "x", label: card }, ...options],
    });
    (
      single.getByRole("radio", { name: "Card" }).element() as HTMLElement
    ).click();
    await expect.poll(() => readBound(single.container)).toBe("x");

    const multiple = await render(Bound, {
      of: RichChoices,
      name: "plan",
      options,
      isMultiple: true,
    });
    (
      multiple.getByRole("checkbox", { name: "A" }).element() as HTMLElement
    ).click();
    await expect.poll(() => readBound(multiple.container)).toEqual(["a"]);
  });
});

describe("RangeField", () => {
  it("mirrors the number in a client-only slider, both ways", async () => {
    const page = await render(Bound, {
      of: RangeField,
      name: "volume",
      min: 0,
      max: 10,
      value: 3,
    });
    const slider = page.getByRole("slider", { name: "volume (slider)" });
    await expect.element(slider).toHaveValue("3");
    const element = slider.element() as HTMLInputElement;
    element.value = "8";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    await expect.poll(() => readBound(page.container)).toBe(8);
    await userEvent.fill(page.getByRole("spinbutton"), "20");
    await expect.element(slider).toHaveValue("10");
  });

  it("names the slider explicitly", async () => {
    const page = await render(RangeField, {
      name: "v",
      min: 0,
      max: 1,
      sliderLabel: "Level",
    });
    await expect
      .element(page.getByRole("slider", { name: "Level" }))
      .toBeInTheDocument();
  });
});

describe("HiddenField", () => {
  it("renders a hidden input with only its id, and nothing when its condition fails", async () => {
    const page = await render(HiddenField, {
      name: "token",
      value: "t",
      error: "Bad",
      isOptional: true,
    });
    const input = page.container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("t");
    expect(input.id).toMatch(/-token$/);
    for (const attribute of [
      "aria-labelledby",
      "aria-describedby",
      "aria-errormessage",
      "aria-invalid",
      "aria-required",
      "required",
    ])
      expect(input.hasAttribute(attribute)).toBe(false);
    const hidden = await render(HiddenField, {
      name: "token",
      condition: () => false,
    });
    expect(hidden.container.querySelector("input")).toBeNull();
  });
});

describe("Form", () => {
  it("renders the subgrid form and passes native attributes through", async () => {
    const page = await render(Form, {
      method: "post",
      action: "/save",
      class: "side",
    });
    const form = page.container.querySelector("form") as HTMLFormElement;
    expect(form.className).toBe("ds form subgrid side");
    expect(form.method).toBe("post");
    expect(form.getAttribute("action")).toBe("/save");
  });
});
