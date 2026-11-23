import { act, render, screen } from "@testing-library/react";
import { type ReactElement, useRef } from "react";
import { describe, expect, it } from "vitest";
import useFocusRescue from "./useFocusRescue.js";

/** A group of two buttons, either disabled or removed, and a fallback. */
const Group = ({
  state,
}: {
  readonly state: "shown" | "disabled" | "removed";
}): ReactElement => {
  const fallback = useRef<HTMLButtonElement>(null);
  const tracked = useFocusRescue({ fallback });
  return (
    <>
      <button ref={fallback} type="button">
        Fallback
      </button>
      <div {...tracked}>
        {state === "removed" ? null : (
          <button type="button" disabled={state === "disabled"}>
            Next
          </button>
        )}
        <button type="button">Other</button>
      </div>
    </>
  );
};

describe("useFocusRescue", () => {
  it("hands the focus of a control disabled under it to the fallback", () => {
    const { rerender } = render(<Group state="shown" />);
    act(() => {
      screen.getByRole("button", { name: "Next" }).focus();
    });
    rerender(<Group state="disabled" />);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Fallback" }),
    );
  });

  it("hands the focus of a control removed under it to the fallback", () => {
    const { rerender } = render(<Group state="shown" />);
    act(() => {
      screen.getByRole("button", { name: "Next" }).focus();
    });
    rerender(<Group state="removed" />);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Fallback" }),
    );
  });

  it("leaves focus the reader moved out of the group alone", () => {
    const { rerender } = render(<Group state="shown" />);
    const next = screen.getByRole("button", { name: "Next" });
    act(() => {
      next.focus();
    });
    act(() => {
      next.blur();
    });
    rerender(<Group state="removed" />);
    expect(document.activeElement).toBe(document.body);
  });
});
