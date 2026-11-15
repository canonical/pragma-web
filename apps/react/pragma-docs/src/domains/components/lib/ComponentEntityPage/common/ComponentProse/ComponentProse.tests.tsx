import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ComponentProse from "./ComponentProse.js";

describe("ComponentProse", () => {
  it("renders the Markdown with its headings two levels down", () => {
    render(
      <ComponentProse
        source={"# One\n\n## Two\n\n### Three\n\nA paragraph."}
      />,
    );
    expect(
      screen.getAllByRole("heading").map(({ tagName }) => tagName),
    ).toEqual(["H3", "H4", "H5"]);
    expect(screen.getByText("A paragraph.").tagName).toBe("P");
  });

  it("stops the levels at six", () => {
    render(<ComponentProse source={"#### Four\n\n##### Five\n\n###### Six"} />);
    expect(
      screen.getAllByRole("heading").map(({ tagName }) => tagName),
    ).toEqual(["H6", "H6", "H6"]);
  });

  it("carries the editorial and content-flow classes beside its own", () => {
    const { container } = render(
      <ComponentProse className="extra" source="Text" />,
    );
    expect(container.firstElementChild?.className).toBe(
      "ds component-prose editorial content-flow extra",
    );
  });

  it("passes the native props to its root", () => {
    render(<ComponentProse data-testid="root" source="Text" />);
    expect(screen.getByTestId("root").tagName).toBe("DIV");
  });
});
