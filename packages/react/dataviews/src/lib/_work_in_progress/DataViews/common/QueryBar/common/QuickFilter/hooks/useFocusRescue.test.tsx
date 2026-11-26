import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import useFocusRescue from "./useFocusRescue.js";

/** A panel of buttons, some of them disabled, and one outside it. */
function Panel({
  items,
  disabled = [],
}: {
  readonly items: readonly string[];
  readonly disabled?: readonly string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusRescue({ containerRef: ref });
  return (
    <>
      <div className="ds filter-button-panel" tabIndex={-1} data-testid="panel">
        <div ref={ref}>
          {items.map((item) => (
            <button key={item} type="button" disabled={disabled.includes(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <button type="button">Outside</button>
    </>
  );
}

const focus = (name: string) =>
  act(() => screen.getByRole("button", { name }).focus());

describe("useFocusRescue", () => {
  it("moves focus to the control that takes a removed one's place", () => {
    const { rerender } = render(<Panel items={["a", "b", "c"]} />);
    focus("b");
    rerender(<Panel items={["a", "c"]} />);
    expect(screen.getByRole("button", { name: "c" })).toHaveFocus();
  });

  it("moves focus to the one before where none follows", () => {
    const { rerender } = render(<Panel items={["a", "b"]} />);
    focus("b");
    rerender(<Panel items={["a"]} />);
    expect(screen.getByRole("button", { name: "a" })).toHaveFocus();
  });

  it("moves focus off a control disabled under it", () => {
    const { rerender } = render(<Panel items={["a", "b", "c"]} />);
    focus("b");
    rerender(<Panel items={["a", "b", "c"]} disabled={["b"]} />);
    expect(screen.getByRole("button", { name: "c" })).toHaveFocus();
  });

  it("moves focus to the panel where no control is left", () => {
    const { rerender } = render(<Panel items={["a"]} />);
    focus("a");
    rerender(<Panel items={[]} />);
    expect(screen.getByTestId("panel")).toHaveFocus();
  });

  it("leaves focus that went elsewhere, and a control that stays", () => {
    const { rerender } = render(<Panel items={["a", "b"]} />);
    focus("b");
    rerender(<Panel items={["a", "b"]} />);
    expect(screen.getByRole("button", { name: "b" })).toHaveFocus();
    focus("Outside");
    rerender(<Panel items={["a"]} />);
    expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
  });
});
