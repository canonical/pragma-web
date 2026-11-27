import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Bound from "../../../testing/Bound.fixtures.svelte";
import CustomScore from "../../../testing/CustomScore.svelte";
import readBound from "../../../testing/readBound.js";
import { Field } from "./index.js";

const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];
const file = new File(["x"], "x.txt", { lastModified: 3 });

const fieldCases: [string, Record<string, unknown>, string, unknown][] = [
  ["text", { inputType: "text" }, "input[type=text]", "v"],
  ["email", { inputType: "email" }, "input[type=email]", "v"],
  ["password", { inputType: "password" }, "input[type=password]", "v"],
  ["number", { inputType: "number" }, "input[type=number]", 3],
  ["textarea", { inputType: "textarea" }, "textarea", "v"],
  ["select", { inputType: "select", options }, "select", "a"],
  [
    "choices",
    { inputType: "choices", options },
    "fieldset.ds.form-choices",
    "a",
  ],
  [
    "rich-choices",
    { inputType: "rich-choices", options },
    "fieldset.ds.form-rich-choices",
    "a",
  ],
  ["checkbox", { inputType: "checkbox" }, "input.ds.form-checkbox", true],
  ["switch", { inputType: "switch" }, "input.ds.form-switch", true],
  ["hidden", { inputType: "hidden" }, "input[type=hidden]", "v"],
  ["range", { inputType: "range", min: 0, max: 10 }, ".ds.range-control", 3],
  ["date", { inputType: "date" }, "input[type=date]", "2026-01-01"],
  ["time", { inputType: "time" }, "input[type=time]", "10:00"],
  [
    "datetime",
    { inputType: "datetime" },
    "input[type=datetime-local]",
    "2026-01-01T10:00",
  ],
  ["file", { inputType: "file" }, ".ds.input.file-upload", [file]],
  ["phone", { inputType: "phone" }, ".ds.input.phone", "+15551234567"],
  ["color", { inputType: "color" }, ".ds.input.color", "#ff0000"],
  ["rating", { inputType: "rating" }, ".ds.form-rating", 3],
  ["combobox", { inputType: "combobox", options }, ".ds.form-combobox", "a"],
];

describe("Field", () => {
  it.each(fieldCases)(
    "routes %s to its field",
    async (_type, props, selector) => {
      const page = await render(Field, {
        name: "f",
        label: "F",
        type: "x",
        ...props,
      } as never);
      expect(page.container.querySelector(selector)).not.toBeNull();
    },
  );

  it("binds a value whose type follows the input type", async () => {
    const text = await render(Bound, {
      of: Field,
      inputType: "text",
      name: "t",
      value: "",
    });
    await userEvent.type(text.getByRole("textbox"), "ok");
    await expect.poll(() => readBound(text.container)).toBe("ok");

    const toggle = await render(Bound, {
      of: Field,
      inputType: "checkbox",
      name: "c",
      label: "C",
    });
    (toggle.getByRole("checkbox").element() as HTMLElement).click();
    await expect.poll(() => readBound(toggle.container)).toBe(true);

    const files = await render(Bound, {
      of: Field,
      inputType: "file",
      name: "u",
    });
    await userEvent.upload(
      files.container.querySelector("input[type=file]") as HTMLInputElement,
      file,
    );
    expect(files.container.querySelector(".file-name")?.textContent).toBe(
      "x.txt",
    );
  });

  it("renders a custom component without chrome, forwarding every prop and binding its value", async () => {
    const page = await render(Bound, {
      of: Field,
      inputType: "custom",
      component: CustomScore,
      name: "score",
      label: "Score",
      description: "Out of ten",
      error: "Too low",
      step: 2,
      value: 4,
    });
    expect(page.container.querySelector(".ds.field")).toBeNull();
    const input = page.container.querySelector("input") as HTMLInputElement;
    expect(input.name).toBe("score");
    expect(input.step).toBe("2");
    expect(input.value).toBe("4");
    expect(page.container.querySelector(".score")?.textContent).toBe("Score");
    expect(
      page.container.querySelector(".score-description")?.textContent,
    ).toBe("Out of ten");
    expect(page.container.querySelector(".score-error")?.textContent).toBe(
      "Too low",
    );
    await userEvent.fill(input, "6");
    await expect.poll(() => readBound(page.container)).toBe(6);
  });

  it.each(fieldCases)(
    "drops the %s value when the field becomes hidden",
    async (_type, props, _selector, value) => {
      const shown = { of: Field, name: "f", label: "F", ...props };
      const page = await render(Bound, {
        ...shown,
        value,
        condition: () => true,
      });
      expect(readBound(page.container)).not.toBeNull();
      await page.rerender({ ...shown, condition: () => false });
      await expect.poll(() => readBound(page.container)).toBeNull();
    },
  );

  it("keeps the value of a field hidden from the start", async () => {
    const page = await render(Bound, {
      of: Field,
      inputType: "text",
      name: "f",
      value: "kept",
      condition: () => false,
    });
    expect(page.container.querySelector("input")).toBeNull();
    expect(readBound(page.container)).toBe("kept");
  });

  it("hides a field whose condition fails", async () => {
    const page = await render(Field, {
      inputType: "text",
      name: "company",
      label: "Company",
      condition: () => false,
    });
    expect(page.container.querySelector(".ds.field")).toBeNull();
  });
});
