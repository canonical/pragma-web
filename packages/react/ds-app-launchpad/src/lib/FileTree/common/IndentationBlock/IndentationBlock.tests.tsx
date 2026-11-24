/* @canonical/generator-ds 0.9.0-experimental.4 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Component from "./IndentationBlock.js";

describe("IndentationBlock component", () => {
  it("renders", () => {
    const { container } = render(<Component depth={2} />);
    expect(container.querySelectorAll(".indent-block")).toHaveLength(2);
  });

  it("applies className and styles", () => {
    const { container } = render(
      <Component
        className={"test-class"}
        style={{ color: "#333" }}
        depth={1}
      />,
    );
    expect(container.querySelector(".ds.indentation-block")).toHaveClass(
      "test-class",
    );
    expect(container.querySelector(".ds.indentation-block")).toHaveStyle({
      color: "#333",
    });
  });

  it("forwards native props to the div root", () => {
    const { container } = render(
      <Component depth={1} data-testid="indent" aria-label="Indentation" />,
    );
    const root = container.querySelector(".ds.indentation-block");
    expect(root?.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-testid", "indent");
    expect(root).toHaveAttribute("aria-label", "Indentation");
  });
});
