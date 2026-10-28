import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import type { ClassPropertyEntry } from "../../types.js";
import FieldList from "./FieldList.js";

const NAMESPACES = [{ prefix: "ds", namespace: "https://ds.canonical.com/" }];

/** A field of a class, as the class fragment selects it. */
function field(
  local: string,
  options: Partial<ClassPropertyEntry> & {
    readonly definition?: string | null;
  } = {},
): ClassPropertyEntry {
  return {
    required: options.required ?? false,
    singular: options.singular ?? false,
    inherited: false,
    property: {
      uri: `https://ds.canonical.com/${local}`,
      label: local,
      definition:
        options.definition === undefined
          ? `What ${local} records.`
          : options.definition,
      range: "http://www.w3.org/2001/XMLSchema#string",
      kind: "DATATYPE",
      domain: { uri: "https://ds.canonical.com/UIBlock", label: "UI Block" },
    },
  } as ClassPropertyEntry;
}

describe("FieldList", () => {
  it("lists each field's link, range, notes and definition", () => {
    render(
      createRouterHarness(
        <FieldList
          className="custom-class"
          data-testid="fields"
          fields={[
            field("summary", { required: true, singular: true }),
            field("usage", { singular: true, definition: null }),
          ]}
          namespaces={NAMESPACES}
        />,
      ),
    );
    const list = screen.getByTestId("fields");
    expect(list.className).toBe("ds field-list custom-class");
    const [summary, usage] = within(list).getAllByRole("listitem");
    expect(
      within(summary as HTMLElement).getByRole("link", { name: "summary" }),
    ).toHaveAttribute("href", "/definitions/ds%3Asummary");
    expect(summary?.querySelector(".range")?.textContent).toBe("xsd:string");
    expect(summary?.querySelector(".notes")?.textContent).toBe(
      "required · singular",
    );
    expect(summary?.querySelector(".definition")?.textContent).toBe(
      "What summary records.",
    );
    expect(usage?.querySelector(".notes")?.textContent).toBe("singular");
    expect(usage?.querySelector(".definition")).toBeNull();
  });
});
