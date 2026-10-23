import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PreviewHeading from "./PreviewHeading.js";

describe("PreviewHeading", () => {
  it("renders the given tag without the id or the syntax-tree node", () => {
    const { container } = render(
      <PreviewHeading
        as="h3"
        id="user-content-title"
        node={{ type: "element" }}
        className="lead"
      >
        Title
      </PreviewHeading>,
    );

    const heading = container.querySelector("h3");
    expect(heading).toHaveTextContent("Title");
    expect(heading).toHaveClass("lead");
    expect(heading).not.toHaveAttribute("id");
    expect(heading).not.toHaveAttribute("node");
  });
});
