import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Option } from "../../../subcomponent/types.js";
import { ComboboxInput } from "./ComboboxInput.js";

const fruits: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];

describe("ComboboxInput (SSR)", () => {
  it("renders the selected item and its hidden input in single mode", () => {
    const html = renderToString(
      <ComboboxInput name="fruit" options={fruits} value="banana" />,
    );
    expect(html).toContain('value="Banana"');
    expect(html).toContain('type="hidden" name="fruit" value="banana"');
  });

  it("renders a chip and a hidden input per value in multiple mode", () => {
    const html = renderToString(
      <ComboboxInput
        isMultiple
        name="fruit"
        options={fruits}
        value={["apple", "banana"]}
      />,
    );
    expect(html).toContain("Apple<span");
    expect(html).toContain("Banana<span");
    expect(html).toContain('type="hidden" name="fruit" value="apple"');
    expect(html).toContain('type="hidden" name="fruit" value="banana"');
  });
});
