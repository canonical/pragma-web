import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../../../common/Roving/index.js";
import Context from "../Context.js";
import type { QueryChipContextValue } from "../types.js";
import Segment from "./Segment.js";

/** A mounted chip in a roving toolbar, whose stop is elsewhere. */
const inToolbar = (
  children: ReactNode,
  chip: Partial<QueryChipContextValue> = {},
) => (
  <RovingProvider activeItem="other" onActiveItemChange={vi.fn()}>
    <Context.Provider
      value={{ id: "chip", isMounted: true, disabled: false, ...chip }}
    >
      {children}
    </Context.Provider>
  </RovingProvider>
);

describe("Segment", () => {
  it("is plain text by default", () => {
    const { container } = render(<Segment>deployed</Segment>);
    expect(container.innerHTML).toBe(
      '<span class="ds query-chip-segment"><span class="text">deployed</span></span>',
    );
  });

  it("is plain text with onActivate before scripts run", () => {
    render(
      inToolbar(<Segment onActivate={vi.fn()}>a</Segment>, {
        isMounted: false,
      }),
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is plain text with onActivate outside a roving toolbar", () => {
    render(
      <Context.Provider value={{ isMounted: true, disabled: false }}>
        <Segment onActivate={vi.fn()}>a</Segment>
      </Context.Provider>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is a roving button with onActivate in a toolbar", () => {
    const onActivate = vi.fn();
    render(
      inToolbar(
        <Segment label="is at least" onActivate={onActivate}>
          ≥
        </Segment>,
      ),
    );
    const button = screen.getByRole("button", { name: "is at least" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("tabindex", "-1");
    expect(button.getAttribute("data-roving-item")).toMatch(/^chip:/);
    fireEvent.click(button);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("is a disabled button in a disabled chip", () => {
    render(
      inToolbar(<Segment onActivate={vi.fn()}>a</Segment>, { disabled: true }),
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("marks a plain-text segment of a disabled chip", () => {
    const { container } = render(
      <Context.Provider value={{ isMounted: false, disabled: true }}>
        <Segment>a</Segment>
      </Context.Provider>,
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-disabled",
      "true",
    );
  });

  it("carries its Condition as a class and shows its mark", () => {
    const { container } = render(<Segment condition="range">between</Segment>);
    const segment = container.firstElementChild;
    expect(segment).toHaveClass("range");
    expect(segment?.querySelector(".glyph")?.className).toBe("glyph");
    expect(segment?.querySelector(".glyph")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("describes its fault and shows Error's glyph in place of the mark", () => {
    render(
      inToolbar(
        <Segment
          condition="match"
          invalid
          description="Invalid: no such operator"
          onActivate={vi.fn()}
        >
          contains
        </Segment>,
      ),
    );
    const button = screen.getByRole("button", { name: "contains" });
    expect(button).toHaveAccessibleDescription("Invalid: no such operator");
    expect(button).toHaveAttribute("data-invalid", "true");
    expect(button).not.toHaveAttribute("aria-invalid");
    const glyphs = button.querySelectorAll(".glyph");
    expect(glyphs).toHaveLength(1);
    expect(glyphs[0]?.className).toBe("glyph error");
  });

  it("renders a refused reason as text after a plain-text segment", () => {
    const { container } = render(
      <Segment description="Refused: not indexed">cpu</Segment>,
    );
    expect(container.lastElementChild).toHaveClass("assistive");
    expect(container.lastElementChild).toHaveTextContent(
      "Refused: not indexed",
    );
    expect(container.querySelector(".glyph")).toBeNull();
  });

  it("speaks its label in place of a plain-text symbol", () => {
    render(<Segment label="is not">≠</Segment>);
    expect(screen.getByText("≠")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("is not")).toHaveClass("assistive");
  });
});
