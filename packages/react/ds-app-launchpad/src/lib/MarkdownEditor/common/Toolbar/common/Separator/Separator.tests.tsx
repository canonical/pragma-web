/* @canonical/generator-ds 0.9.0-experimental.4 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Component from "./Separator.js";

describe("ToolbarSeparator component", () => {
  it("applies className", () => {
    const { container } = render(<Component className={"test-class"} />);
    expect(container.firstChild).toHaveClass("test-class");
  });

  it("forwards native props to the div root", () => {
    render(<Component data-testid="separator" aria-hidden="true" />);
    const separator = document.querySelector(".ds.toolbar-separator");
    expect(separator?.tagName).toBe("DIV");
    expect(separator).toHaveClass("ds toolbar-separator");
    expect(separator).toHaveAttribute("data-testid", "separator");
    expect(separator).toHaveAttribute("aria-hidden", "true");
  });
});
