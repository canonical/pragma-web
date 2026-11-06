import { render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { describe, expect, it } from "vitest";
import * as decorators from "./decorators.js";

/** A story stand-in: one element the decorators wrap. */
const Story: ElementType = () => <span data-testid="story">Story</span>;

/** Expects `container` to hold one surface band around the story. */
function expectSurfaceBand(container: HTMLElement) {
  const band = container.firstElementChild;
  expect(band).toBeInstanceOf(HTMLElement);
  if (!(band instanceof HTMLElement)) return;
  expect(band).toHaveClass("surface");
  expect(band.style.background).toBe("var(--surface-color-background)");
  expect(band.style.color).toBe("var(--surface-color-text)");
  expect(band.style.padding).toBe("var(--dimension-300, 24px)");
  expect(screen.getByTestId("story").closest(".surface")).toBe(band);
}

describe("rtl", () => {
  it("wraps the story in dir=rtl", () => {
    render(decorators.rtl()(Story));
    expect(screen.getByTestId("story").closest("[dir]")).toHaveAttribute(
      "dir",
      "rtl",
    );
  });
});

describe("surface", () => {
  it("paints the story on one surface, with padding", () => {
    const { container } = render(decorators.surface()(Story));
    expectSurfaceBand(container);
  });
});

describe("gridSpanAll", () => {
  it("spans every column of the enclosing grid", () => {
    expect(decorators.gridSpanAll).toEqual({ gridColumn: "1 / -1" });
  });
});

describe("surfaces", () => {
  it("stacks three nested surface bands", () => {
    const { container } = render(
      decorators.surfaces((level) => <span>Level {level}</span>),
    );
    expect(container.querySelectorAll(".surface")).toHaveLength(3);
    expect(
      screen.getByText("Level 2").closest(".surface .surface .surface"),
    ).not.toBeNull();
  });
});

describe("grid", () => {
  it("wraps the story in the bare grid preset", () => {
    render(decorators.grid()(Story));
    expect(screen.getByTestId("story").closest(".grid")).toBeInTheDocument();
  });
});

describe("beforeMain", () => {
  it("places the story before a focusable main element", () => {
    const { container } = render(
      decorators.beforeMain({ id: "content", children: <p>Main</p> })(Story),
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
