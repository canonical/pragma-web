import { describe, expect, it, onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Bound from "../../../testing/Bound.fixtures.svelte";
import readBound from "../../../testing/readBound.js";
import "../../index.css";
import { PhoneInput } from "./index.js";

const countries = [
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    format: "(###) ###-####",
  },
  { code: "CA", name: "Canada", dialCode: "+1" },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    format: "#### ######",
  },
];

const numberInput = (container: HTMLElement) =>
  container.querySelector(".number-input") as HTMLInputElement;
const countrySelect = (container: HTMLElement) =>
  container.querySelector(".country-select") as HTMLSelectElement;

/** Replaces the number as a single input event of the given type. */
function input(
  node: HTMLInputElement,
  value: string,
  caret: number,
  inputType: string,
) {
  node.value = value;
  node.setSelectionRange(caret, caret);
  node.dispatchEvent(new InputEvent("input", { bubbles: true, inputType }));
}

describe("PhoneInput", () => {
  it("emits an E.164 value as digits are typed, grouped by the mask", async () => {
    const page = await render(Bound, {
      of: PhoneInput,
      countries,
      mask: true,
      name: "phone",
    });
    const number = numberInput(page.container);
    await userEvent.type(number, "5551234567");
    expect(number.value).toBe("(555) 123-4567");
    await expect.poll(() => readBound(page.container)).toBe("+15551234567");
    await userEvent.clear(number);
    await expect.poll(() => readBound(page.container)).toBe("");
  });

  it("re-emits the number with the chosen country", async () => {
    const page = await render(Bound, {
      of: PhoneInput,
      countries,
      value: "+15551234",
    });
    await userEvent.selectOptions(countrySelect(page.container), "GB");
    await expect.poll(() => readBound(page.container)).toBe("+445551234");
    await userEvent.selectOptions(countrySelect(page.container), "CA");
    await expect.poll(() => readBound(page.container)).toBe("+15551234");
    expect(countrySelect(page.container).value).toBe("CA");
  });

  it("keeps an empty number empty when the country changes", async () => {
    const page = await render(Bound, { of: PhoneInput, countries, value: "" });
    await userEvent.selectOptions(countrySelect(page.container), "GB");
    await expect.poll(() => readBound(page.container)).toBe("");
    expect(countrySelect(page.container).value).toBe("GB");
  });

  it("emits a structured value and follows its country", async () => {
    const page = await render(Bound, {
      of: PhoneInput,
      countries,
      valueFormat: "structured",
      value: { countryCode: "GB", number: "" },
    });
    expect(countrySelect(page.container).value).toBe("GB");
    await userEvent.type(numberInput(page.container), "7700");
    await expect
      .poll(() => readBound(page.container))
      .toEqual({ countryCode: "GB", number: "7700" });
    await userEvent.selectOptions(countrySelect(page.container), "US");
    await expect
      .poll(() => readBound(page.container))
      .toEqual({ countryCode: "US", number: "7700" });
  });

  it("falls back to the first country for an unknown structured country", async () => {
    const page = await render(PhoneInput, {
      countries,
      valueFormat: "structured",
      value: { countryCode: "XX", number: "1" },
    });
    expect(countrySelect(page.container).value).toBe("US");
    expect(countrySelect(page.container).hasAttribute("name")).toBe(false);
  });

  it("puts the id and field wiring on the number input", async () => {
    const page = await render(PhoneInput, {
      countries,
      id: "tel",
      "aria-labelledby": "tel-label",
      "aria-describedby": "tel-error",
    });
    const number = numberInput(page.container);
    expect(number.id).toBe("tel");
    expect(number.getAttribute("aria-labelledby")).toBe("tel-label");
    expect(number.getAttribute("aria-describedby")).toBe("tel-error");
    expect(number.hasAttribute("aria-label")).toBe(false);
    expect(page.container.querySelector(".ds.input.phone")?.id).toBe("");
  });

  it("deletes the digit next to a deleted separator", async () => {
    const page = await render(Bound, {
      of: PhoneInput,
      countries,
      mask: true,
      value: "+15551234567",
    });
    const number = numberInput(page.container);
    number.focus();
    expect(number.value).toBe("(555) 123-4567");
    input(number, "(555) 1234567", 9, "deleteContentBackward");
    await expect.poll(() => readBound(page.container)).toBe("+1555124567");
    input(number, "(555) 124567", 9, "deleteContentForward");
    await expect.poll(() => readBound(page.container)).toBe("+155512467");
    input(number, "555) 124-67", 0, "deleteContentBackward");
    await expect.poll(() => readBound(page.container)).toBe("+155512467");
  });

  it("waits for a composition to end before formatting", async () => {
    const page = await render(Bound, { of: PhoneInput, countries, value: "" });
    const number = numberInput(page.container);
    number.dispatchEvent(new CompositionEvent("compositionstart"));
    input(number, "12", 2, "insertCompositionText");
    await expect.poll(() => readBound(page.container)).toBe("");
    number.dispatchEvent(new CompositionEvent("compositionend"));
    await expect.poll(() => readBound(page.container)).toBe("+112");
  });

  it("labels countries by code, name or flag and orders them", async () => {
    const page = await render(PhoneInput, {
      countries,
      countryDisplay: "flag",
      preferredCountries: ["GB"],
      name: "tel",
      countryLabel: "Country",
      numberLabel: "Number",
    });
    const select = countrySelect(page.container);
    expect([...select.options].map((option) => option.textContent)).toEqual([
      "+44 🇬🇧",
      "+1 🇨🇦",
      "+1 🇺🇸",
    ]);
    expect(select.name).toBe("tel-country");
    expect(select.getAttribute("aria-label")).toBe("Country");
    expect(numberInput(page.container).getAttribute("aria-label")).toBe(
      "Number",
    );
  });

  it("uses the bundled country dataset by default", async () => {
    const page = await render(PhoneInput, { countryDisplay: "name" });
    expect(countrySelect(page.container).options.length).toBeGreaterThan(100);
    expect(countrySelect(page.container).value).toBe("US");
  });

  it("updates its controls without losing the country", async () => {
    const page = await render(PhoneInput, { countries, value: "+447700" });
    await page.rerender({
      countries,
      value: "+447700",
      disabled: true,
      countryLabel: "Land",
    });
    expect(countrySelect(page.container).value).toBe("GB");
    expect(countrySelect(page.container).disabled).toBe(true);
  });

  it("refuses an empty country list", async () => {
    await expect(render(PhoneInput, { countries: [] })).rejects.toThrow(
      "non-empty `countries`",
    );
  });

  it("shows the focus ring on the chrome while the number has focus", async () => {
    const page = await render(PhoneInput, { countries });
    document.documentElement.style.setProperty(
      "--color-focus-ring",
      "rgb(10, 70, 180)",
    );
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--color-focus-ring");
    });
    const chrome = page.container.querySelector(
      ".ds.input.phone.chrome",
    ) as HTMLElement;
    expect(getComputedStyle(chrome).boxShadow).not.toContain(
      "rgb(10, 70, 180)",
    );
    // A real click, not element.focus(): WebKit matches :focus-within only
    // while the test frame itself has focus, which a script call never gives.
    // The style is polled: Firefox can report the focused style a frame after
    // the click resolves.
    await userEvent.click(numberInput(page.container));
    await expect
      .poll(() => document.activeElement)
      .toBe(numberInput(page.container));
    await expect
      .poll(() => getComputedStyle(chrome).boxShadow)
      .toContain("rgb(10, 70, 180)");
  });
});
