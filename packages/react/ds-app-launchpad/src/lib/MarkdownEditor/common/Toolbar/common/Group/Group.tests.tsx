/* @canonical/generator-ds 0.9.0-experimental.4 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Component from "./Group.js";

describe("ToolbarGroup component", () => {
  it("renders", () => {
    render(<Component label="test">ToolbarGroup</Component>);
    expect(screen.getByText("ToolbarGroup")).toBeInTheDocument();
  });

  it("applies className", () => {
    render(
      <Component label="test" className={"test-class"}>
        ToolbarGroup
      </Component>,
    );
    expect(screen.getByText("ToolbarGroup")).toHaveClass("test-class");
  });

  it("forwards native props to the div root", () => {
    render(
      <Component label="test" data-testid="toolbar-group">
        ToolbarGroup
      </Component>,
    );
    const group = screen.getByRole("group", { name: "test" });
    expect(group).toHaveClass("ds toolbar-group");
    expect(group).toHaveAttribute("data-testid", "toolbar-group");
  });
});
