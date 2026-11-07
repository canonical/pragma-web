import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";
import beforeMain from "./beforeMain.js";

/** A story stand-in. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("beforeMain", () => {
  it("places the story before a focusable main element", () => {
    const { container } = render(
      beforeMain({ id: "content", children: <p>Main</p> })(Story),
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
