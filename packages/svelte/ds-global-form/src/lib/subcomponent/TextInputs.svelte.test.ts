import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Bound from "../../testing/Bound.fixtures.svelte";
import readBound from "../../testing/readBound.js";
import { DateInput } from "./DateInput/index.js";
import { DateTimeInput } from "./DateTimeInput/index.js";
import { HiddenInput } from "./HiddenInput/index.js";
import { NumberInput } from "./NumberInput/index.js";
import { PasswordInput } from "./PasswordInput/index.js";
import { RangeInput } from "./RangeInput/index.js";
import { TextareaInput } from "./TextareaInput/index.js";
import { TextInput } from "./TextInput/index.js";
import { TimeInput } from "./TimeInput/index.js";

const unit = createRawSnippet(() => ({ render: () => "<b>kg</b>" }));

describe("TextInput", () => {
  it("binds the typed value and renders text adornments", async () => {
    const page = await render(Bound, {
      of: TextInput,
      name: "site",
      prefix: "https://",
      suffix: ".com",
      value: "",
    });
    await userEvent.type(page.getByRole("textbox"), "ada");
    await expect.poll(() => readBound(page.container)).toBe("ada");
    expect(page.container.querySelector(".prefix")?.textContent).toBe(
      "https://",
    );
    expect(page.container.querySelector(".suffix")?.textContent).toBe(".com");
  });

  it("renders snippet adornments and the requested input type", async () => {
    const page = await render(TextInput, {
      inputType: "email",
      prefix: unit,
      suffix: unit,
    });
    expect(page.container.querySelector("input")?.type).toBe("email");
    expect(page.container.querySelectorAll("b")).toHaveLength(2);
  });
});

describe("NumberInput", () => {
  it("binds a number, null when cleared, with adornments", async () => {
    const page = await render(Bound, {
      of: NumberInput,
      id: "n",
      prefix: "$",
      suffix: unit,
      value: 1,
    });
    const input = page.getByRole("spinbutton");
    await userEvent.fill(input, "42");
    await expect.poll(() => readBound(page.container)).toBe(42);
    await userEvent.clear(input);
    await expect.poll(() => readBound(page.container)).toBeNull();
    expect(page.container.querySelector("input")?.id).toBe("n");
  });

  it("renders without adornments", async () => {
    const page = await render(NumberInput, {});
    expect(page.container.querySelector(".prefix")).toBeNull();
  });
});

describe("PasswordInput", () => {
  it("masks, reveals and binds the value", async () => {
    const page = await render(Bound, { of: PasswordInput, value: "" });
    const input = page.container.querySelector("input") as HTMLInputElement;
    await userEvent.type(input, "secret");
    await expect.poll(() => readBound(page.container)).toBe("secret");
    const toggle = page.getByRole("button", { name: "Show password" });
    expect(toggle.element().getAttribute("aria-controls")).toBe(input.id);
    (toggle.element() as HTMLElement).click();
    await expect.poll(() => input.type).toBe("text");
    (
      page
        .getByRole("button", { name: "Hide password" })
        .element() as HTMLElement
    ).click();
    await expect.poll(() => input.type).toBe("password");
  });

  it("can drop the toggle and keep a given id", async () => {
    const page = await render(PasswordInput, { id: "pw", revealable: false });
    expect(page.container.querySelector("button")).toBeNull();
    expect(page.container.querySelector("input")?.id).toBe("pw");
  });
});

describe("TextareaInput", () => {
  it("binds the typed value", async () => {
    const page = await render(Bound, { of: TextareaInput, value: "" });
    await userEvent.type(page.getByRole("textbox"), "hello");
    await expect.poll(() => readBound(page.container)).toBe("hello");
  });
});

describe("date and time inputs", () => {
  it.each([
    [DateInput, "date", "2026-03-04"],
    [TimeInput, "time", "09:30"],
    [DateTimeInput, "datetime-local", "2026-03-04T09:30"],
  ] as const)("binds the ISO value of %#", async (component, type, value) => {
    const page = await render(Bound, {
      of: component,
      min: undefined,
      value: "",
    });
    const input = page.container.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe(type);
    await userEvent.fill(input, value);
    await expect.poll(() => readBound(page.container)).toBe(value);
  });
});

describe("HiddenInput", () => {
  it("submits its bound value", async () => {
    const page = await render(HiddenInput, { name: "token", value: "abc" });
    const input = page.container.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe("hidden");
    expect(input.value).toBe("abc");
  });
});

describe("RangeInput", () => {
  it("binds the value and shows it in the output", async () => {
    const page = await render(Bound, {
      of: RangeInput,
      id: "r",
      min: 0,
      max: 10,
      value: 3,
    });
    const input = page.container.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("aria-valuemax")).toBe("10");
    expect(
      page.container.querySelector("output.ds.range-output")?.textContent,
    ).toBe("3");
    input.value = "7";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await expect.poll(() => readBound(page.container)).toBe(7);
  });
});
