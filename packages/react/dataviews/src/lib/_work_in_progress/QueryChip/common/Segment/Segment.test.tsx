import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../../../common/Roving/index.js";
import QueryChip from "../../QueryChip.js";
import Segment from "./Segment.js";

/** A roving toolbar whose stop is elsewhere, where interactive chips live. */
const Toolbar = ({ children }: { children: ReactNode }) => (
  <RovingProvider activeItem="other" onActiveItemChange={vi.fn()}>
    {children}
  </RovingProvider>
);

describe("Segment", () => {
  it("is plain text without onActivate", () => {
    const { container } = render(<Segment>deployed</Segment>);
    expect(container.innerHTML).toBe(
      '<span class="ds query-chip-segment"><span class="text">deployed</span></span>',
    );
  });

  it("is plain text outside a mounted chip, with its native props", () => {
    render(
      <Segment onActivate={vi.fn()} title="The field">
        status
      </Segment>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByTitle("The field")).toHaveTextContent("status");
  });

  it("is a button with onActivate in a chip, taking a button's props", () => {
    const onActivate = vi.fn();
    render(
      <Toolbar>
        <QueryChip id="chip" label="at least">
          <Segment
            label="at least"
            onActivate={onActivate}
            className="mine"
            title="Operator"
          >
            ≥
          </Segment>
        </QueryChip>
      </Toolbar>,
    );
    const button = screen.getByRole("button", { name: "at least" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("title", "Operator");
    expect(button).toHaveClass("ds", "query-chip-segment", "mine");
    expect(button).toHaveAttribute("tabindex", "-1");
    expect(button).toHaveAttribute("data-roving-item", "chip");
    fireEvent.click(button);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("carries its Condition as a data attribute and shows its mark", () => {
    const { container } = render(<Segment condition="range">between</Segment>);
    const segment = container.firstElementChild;
    expect(segment).toHaveAttribute("data-condition", "range");
    expect(segment).not.toHaveClass("range");
    expect(segment?.querySelector(".glyph")?.className).toBe("glyph");
    expect(segment?.querySelector(".glyph")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("describes its fault and shows Error's glyph in place of the mark", () => {
    render(
      <Toolbar>
        <QueryChip id="chip" label="contains">
          <Segment
            condition="match"
            invalid
            description="Invalid: no such operator"
            onActivate={vi.fn()}
          >
            contains
          </Segment>
        </QueryChip>
      </Toolbar>,
    );
    const button = screen.getByRole("button", { name: "contains" });
    expect(button).toHaveAccessibleDescription("Invalid: no such operator");
    expect(button).toHaveAttribute("data-invalid", "true");
    expect(button).not.toHaveAttribute("aria-invalid");
    expect(
      [...button.querySelectorAll(".glyph")].map((glyph) => glyph.className),
    ).toEqual(["glyph error"]);
  });

  it("shows Error's glyph on a refused chip's first Segment only", () => {
    const { container } = render(
      <QueryChip criticality="error">
        <Segment description="Refused: not indexed">cpu</Segment>
        <Segment condition="inclusion">is</Segment>
      </QueryChip>,
    );
    const glyphs = [...container.querySelectorAll(".glyph")];
    expect(glyphs.map((glyph) => glyph.className)).toEqual([
      "glyph error",
      "glyph",
    ]);
  });

  it("shows one glyph on a refused chip's first Segment that is also at fault", () => {
    const { container } = render(
      <QueryChip criticality="error">
        <Segment invalid description="Invalid: no such field">
          cpu
        </Segment>
      </QueryChip>,
    );
    expect(container.querySelectorAll(".glyph")).toHaveLength(1);
  });

  it("speaks a button's description once, through the button", () => {
    render(
      <Toolbar>
        <QueryChip id="chip" label="cpu">
          <Segment description="Refused: not indexed" onActivate={vi.fn()}>
            cpu
          </Segment>
        </QueryChip>
      </Toolbar>,
    );
    const button = screen.getByRole("button", { name: "cpu" });
    expect(button).toHaveAccessibleDescription("Refused: not indexed");
    const description = document.getElementById(
      button.getAttribute("aria-describedby") ?? "",
    );
    expect(description).not.toBeVisible();
    expect(description).toHaveAttribute("hidden");
  });

  it("keeps the host's ref, focus handler and description on the toolbar item", () => {
    const ref = createRef<HTMLButtonElement>();
    const onFocus = vi.fn();
    const onActiveItemChange = vi.fn();
    render(
      <>
        <span id="hint">Press Enter to edit</span>
        <RovingProvider
          activeItem="other"
          onActiveItemChange={onActiveItemChange}
        >
          <QueryChip id="chip" label="status">
            <Segment
              ref={ref}
              onFocus={onFocus}
              aria-describedby="hint"
              onActivate={vi.fn()}
            >
              status
            </Segment>
          </QueryChip>
        </RovingProvider>
      </>,
    );
    const button = screen.getByRole("button", { name: "status" });
    expect(ref.current).toBe(button);
    expect(button).toHaveAccessibleDescription("Press Enter to edit");
    fireEvent.focus(button);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onActiveItemChange).toHaveBeenCalledWith("chip");
  });

  it("keeps a button's ref off its plain-text form", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Segment onActivate={vi.fn()} ref={ref}>
        status
      </Segment>,
    );
    expect(ref.current).toBeNull();
  });

  it("gives a plain-text Segment's ref its span", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Segment ref={ref}>status</Segment>);
    expect(ref.current?.tagName).toBe("SPAN");
  });

  it("drops the button-only props from its plain-text form", () => {
    render(
      <Segment onActivate={vi.fn()} name="field" form="query" title="Field">
        status
      </Segment>,
    );
    const segment = screen.getByTitle("Field");
    expect(segment).not.toHaveAttribute("name");
    expect(segment).not.toHaveAttribute("form");
  });

  it("marks a plain-text Segment of a disabled chip", () => {
    const { container } = render(
      <QueryChip disabled>
        <Segment>a</Segment>
      </QueryChip>,
    );
    expect(container.querySelector(".ds.query-chip-segment")).toHaveAttribute(
      "data-disabled",
      "true",
    );
  });

  it("speaks its label in place of a plain-text symbol", () => {
    render(<Segment label="is not">≠</Segment>);
    expect(screen.getByText("≠")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("is not")).toHaveClass("assistive");
  });
});
