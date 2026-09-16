/**
 * A long press was taken by one reading of the event — whether the handler
 * accepts it — and handed on as a bare target and container for the caller
 * to read again, while a tap was handed the raw click to read a third time.
 * Three readings of one question could each answer it differently, and a
 * tap on something no press would take still reached the caller.
 *
 * One `claim` answers what a press or a click landed on, or null; a press
 * is claimed where it begins and when it fires, a tap when it lands, and
 * each handler is handed the claim alone.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";
import useLongPress from "../../lib/hooks/useLongPress.js";

const touch = { pointerType: "touch", clientX: 10, clientY: 10 };

describe("a press and a tap", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("are each handed what the claim answered, and nothing unclaimed", () => {
    const onLongPress = vi.fn();
    const onTap = vi.fn();
    const Rows = () => {
      const gestures = useLongPress({
        claim: (target) =>
          target instanceof Element ? target.getAttribute("data-row-id") : null,
        onLongPress,
        onTap,
      });
      return (
        <div {...gestures}>
          <span data-row-id="r-1">one</span>
          <span>header</span>
        </div>
      );
    };
    render(<Rows />);
    const claimed = screen.getByText("one");
    const unclaimed = screen.getByText("header");
    fireEvent.pointerDown(claimed, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).toHaveBeenCalledWith("r-1");
    fireEvent.pointerUp(claimed, touch);
    fireEvent.click(claimed);
    fireEvent.click(claimed);
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledWith("r-1");
    fireEvent.pointerDown(unclaimed, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    fireEvent.click(unclaimed);
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledTimes(1);
  });
});
