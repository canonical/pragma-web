import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import type { Option } from "../../../subcomponent/types.js";
import { ComboboxInput } from "./index.js";

const fruits: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];

describe("ComboboxInput (SSR)", () => {
  it("renders the selected item and its hidden input in single mode", () => {
    const { container } = render(ComboboxInput, {
      props: { name: "fruit", options: fruits, value: "banana" },
    });
    expect(
      (container.querySelector('[role="combobox"]') as HTMLInputElement).value,
    ).toBe("Banana");
    expect(
      [...container.querySelectorAll('input[type="hidden"]')].map((input) => [
        input.getAttribute("name"),
        input.getAttribute("value"),
      ]),
    ).toEqual([["fruit", "banana"]]);
  });

  it("renders a chip and a hidden input per value in multiple mode", () => {
    const { container } = render(ComboboxInput, {
      props: {
        isMultiple: true,
        name: "fruit",
        options: fruits,
        value: ["apple", "banana"],
      },
    });
    expect(
      [...container.querySelectorAll(".chip")].map((chip) => chip.textContent),
    ).toEqual(["Apple×", "Banana×"]);
    expect(
      [...container.querySelectorAll('input[type="hidden"]')].map((input) => [
        input.getAttribute("name"),
        input.getAttribute("value"),
      ]),
    ).toEqual([
      ["fruit", "apple"],
      ["fruit", "banana"],
    ]);
  });
});
