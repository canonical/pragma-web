import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";
import withMainAfter from "./withMainAfter.js";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("withMainAfter", () => {
  it("places the story before a focusable main element", () => {
    const { container } = render(
      withMainAfter({ id: "content", children: <p>Main</p> })(Story),
    );
    const main = container.querySelector("main#content");
    expect(main).not.toBeNull();
    if (!main) return;
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(main).toHaveTextContent("Main");
    expect(
      screen.getByTestId("story").compareDocumentPosition(main) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
