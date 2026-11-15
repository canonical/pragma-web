import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import componentEntityRecordsButton from "../../../../__fixtures__/componentEntityRecordsButton.js";
import ComponentProse from "./ComponentProse.js";

/** Button's usage text as the graph serves it: its headings start at `###`. */
const BUTTON_USAGE = (
  componentEntityRecordsButton as unknown as Record<
    string,
    { readonly usage?: string }
  >
)["https://ds.canonical.com/global.component.button"]?.usage;

describe("ComponentProse", () => {
  it("renders the Markdown with its headings two levels down", () => {
    render(
      <ComponentProse
        scope="usage"
        source={"# One\n\n## Two\n\n### Three\n\nA paragraph."}
      />,
    );
    expect(
      screen.getAllByRole("heading").map(({ tagName }) => tagName),
    ).toEqual(["H3", "H4", "H5"]);
    expect(screen.getByText("A paragraph.").tagName).toBe("P");
  });

  it("starts a text authored from level 3, as Button's usage is, at level 3", () => {
    if (BUTTON_USAGE === undefined) throw new Error("the fixture lost usage");
    render(<ComponentProse scope="usage" source={BUTTON_USAGE} />);
    expect(
      screen.getAllByRole("heading").map(({ tagName }) => tagName),
    ).toEqual(["H3", "H3", "H3"]);
  });

  it("stops the levels at six", () => {
    render(
      <ComponentProse
        scope="usage"
        source={"# One\n\n##### Five\n\n###### Six"}
      />,
    );
    expect(
      screen.getAllByRole("heading").map(({ tagName }) => tagName),
    ).toEqual(["H3", "H6", "H6"]);
  });

  it("carries the editorial and content-flow classes beside its own", () => {
    const { container } = render(
      <ComponentProse scope="usage" className="extra" source="Text" />,
    );
    expect(container.firstElementChild?.className).toBe(
      "ds component-prose editorial content-flow extra",
    );
  });

  it("passes the native props to its root", () => {
    render(<ComponentProse scope="usage" data-testid="root" source="Text" />);
    expect(screen.getByTestId("root").tagName).toBe("DIV");
  });
});
