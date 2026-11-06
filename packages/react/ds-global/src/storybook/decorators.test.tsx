import { render, screen } from "@testing-library/react";
import type { ElementType, ReactElement } from "react";
import { describe, expect, it } from "vitest";
import * as decorators from "./decorators.js";

/** A story stand-in: one element the decorators wrap. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

describe("story decorators", () => {
  it("rtl wraps the story in dir=rtl", () => {
    render(decorators.rtl()(Story));
    expect(screen.getByTestId("story").closest("[dir]")).toHaveAttribute(
      "dir",
      "rtl",
    );
  });

  it("gridSpanAll spans every column of the enclosing grid", () => {
    expect(decorators.gridSpanAll).toEqual({ gridColumn: "1 / -1" });
  });

  it("surfaces stacks three nested surface bands", () => {
    const { container } = render(
      decorators.surfaces((level) => <span>Level {level}</span>),
    );
    expect(container.querySelectorAll(".surface")).toHaveLength(3);
    expect(
      screen.getByText("Level 2").closest(".surface .surface .surface"),
    ).not.toBeNull();
  });

  it("grid wraps the story in the bare grid preset", () => {
    render(decorators.grid()(Story));
    expect(screen.getByTestId("story").closest(".grid")).toBeInTheDocument();
  });

  it("beforeMain places the story before a focusable main element", () => {
    const { container } = render(
      decorators.beforeMain({ id: "content", children: <p>Main</p> })(Story),
    );
    const main = container.querySelector("main#content");
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(main).toHaveTextContent("Main");
    expect(
      screen.getByTestId("story").compareDocumentPosition(main as Element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  // Fails until the shared single-surface decorator exists.
  it.fails("surface paints the story on one surface, with padding", async () => {
    const { surface } = (await import("./decorators.js")) as unknown as {
      surface: (Story: ElementType) => ReactElement;
    };
    const { container } = render(surface(Story));
    const band = container.firstElementChild as HTMLElement;
    expect(band).toHaveClass("surface");
    expect(band.style.background).toBe("var(--surface-color-background)");
    expect(band.style.color).toBe("var(--surface-color-text)");
    expect(band.style.padding).toBe("var(--dimension-300, 24px)");
    expect(screen.getByTestId("story").closest(".surface")).toBe(band);
  });
});
