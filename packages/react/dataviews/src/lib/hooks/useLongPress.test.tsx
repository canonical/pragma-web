/**
 * A long press on touch, told apart from a tap and from a scroll, with the
 * click a released long press still produces swallowed and the platform's
 * context menu held off while a press is tracked.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LONG_PRESS_MS, LONG_PRESS_SLOP_PX } from "./constants.js";
import useLongPress from "./useLongPress.js";

/** Every press the row under test takes is its own. */
const claimEvery = () => "row";

const Pressable = ({
  onLongPress,
  onTap,
}: {
  readonly onLongPress: () => void;
  readonly onTap: () => void;
}) => {
  const gestures = useLongPress({ claim: claimEvery, onLongPress, onTap });
  return (
    // biome-ignore lint/a11y/useSemanticElements: the row under test is structure, as the table's is
    // biome-ignore lint/a11y/useFocusableInteractive: the gestures are an enhancement over the row's own controls
    <div role="row" {...gestures}>
      row
    </div>
  );
};

const mount = () => {
  const onLongPress = vi.fn();
  const onTap = vi.fn();
  render(<Pressable onLongPress={onLongPress} onTap={onTap} />);
  return { row: screen.getByRole("row"), onLongPress, onTap };
};

const touch = { pointerType: "touch", clientX: 10, clientY: 10 };

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls a touch held for the delay a long press, and swallows its click", () => {
    const { row, onLongPress, onTap } = mount();
    fireEvent.pointerDown(row, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS - 1);
    expect(onLongPress).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(row, touch);
    // The click the release produces is the press's, not a tap.
    const click = fireEvent.click(row);
    expect(click).toBe(false);
    expect(onTap).not.toHaveBeenCalled();
    // The next click is a tap again.
    fireEvent.click(row);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it("calls a touch released before the delay a tap", () => {
    const { row, onLongPress, onTap } = mount();
    fireEvent.pointerDown(row, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS / 2);
    fireEvent.pointerUp(row, touch);
    fireEvent.click(row);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).not.toHaveBeenCalled();
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it("calls a touch that drifts a scroll, and neither", () => {
    const { row, onLongPress, onTap } = mount();
    fireEvent.pointerDown(row, touch);
    fireEvent.pointerMove(row, { ...touch, clientY: 40 });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).not.toHaveBeenCalled();
    expect(onTap).not.toHaveBeenCalled();
    // A drift within the slop is still a press.
    fireEvent.pointerDown(row, touch);
    fireEvent.pointerMove(row, { ...touch, clientX: 14 });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("lets a cancelled or left press go", () => {
    const { row, onLongPress } = mount();
    fireEvent.pointerDown(row, touch);
    fireEvent.pointerCancel(row, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    fireEvent.pointerDown(row, touch);
    fireEvent.pointerLeave(row, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("never calls a mouse a long press, and leaves its context menu alone", () => {
    const { row, onLongPress, onTap } = mount();
    fireEvent.pointerDown(row, {
      pointerType: "mouse",
      clientX: 10,
      clientY: 10,
    });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).not.toHaveBeenCalled();
    expect(fireEvent.contextMenu(row)).toBe(true);
    fireEvent.click(row);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it("holds the platform's context menu off while a touch is pressed or just was", () => {
    const { row } = mount();
    fireEvent.pointerDown(row, touch);
    expect(fireEvent.contextMenu(row)).toBe(false);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(fireEvent.contextMenu(row)).toBe(false);
    fireEvent.click(row);
    expect(fireEvent.contextMenu(row)).toBe(true);
  });

  it("lets a press still tracked go when the element unmounts", () => {
    const onLongPress = vi.fn();
    const { unmount } = render(
      <Pressable onLongPress={onLongPress} onTap={vi.fn()} />,
    );
    fireEvent.pointerDown(screen.getByRole("row"), touch);
    unmount();
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("takes a new press of any pointer for no release of the last", () => {
    // Fired, then left rather than released: no release timer lets it go,
    // so the next press itself must.
    const { row, onTap } = mount();
    fireEvent.pointerDown(row, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    fireEvent.pointerLeave(row, touch);
    fireEvent.pointerDown(row, {
      pointerType: "mouse",
      clientX: 1,
      clientY: 1,
    });
    fireEvent.click(row);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it("lets a fired press go a tick after a cancelled release too", () => {
    const { row, onTap } = mount();
    fireEvent.pointerDown(row, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    fireEvent.pointerCancel(row, touch);
    vi.advanceTimersByTime(0);
    expect(fireEvent.contextMenu(row)).toBe(true);
    fireEvent.click(row);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it("starts no press, and takes no tap, its element does not claim", () => {
    const onLongPress = vi.fn();
    const onTap = vi.fn();
    const Refusing = () => {
      const gestures = useLongPress({
        claim: () => null,
        onLongPress,
        onTap,
      });
      return (
        // biome-ignore lint/a11y/useSemanticElements: the row under test is structure, as the table's is
        // biome-ignore lint/a11y/useFocusableInteractive: the gestures are an enhancement over the row's own controls
        <div role="row" {...gestures}>
          row
        </div>
      );
    };
    render(<Refusing />);
    const row = screen.getByRole("row");
    fireEvent.pointerDown(row, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).not.toHaveBeenCalled();
    expect(fireEvent.contextMenu(row)).toBe(true);
    fireEvent.click(row);
    expect(onTap).not.toHaveBeenCalled();
  });

  it("hands a long press nothing once what it began on is no longer claimed", () => {
    const onLongPress = vi.fn();
    let claimed: string | null = "row";
    const Leaving = () => {
      const gestures = useLongPress({
        claim: () => claimed,
        onLongPress,
        onTap: () => undefined,
      });
      return (
        // biome-ignore lint/a11y/useSemanticElements: the row under test is structure, as the table's is
        // biome-ignore lint/a11y/useFocusableInteractive: the gestures are an enhancement over the row's own controls
        <div role="row" {...gestures}>
          row
        </div>
      );
    };
    render(<Leaving />);
    const row = screen.getByRole("row");
    fireEvent.pointerDown(row, touch);
    claimed = null;
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).not.toHaveBeenCalled();
    // Still swallowed as a press's release, so no tap follows it.
    expect(fireEvent.click(row)).toBe(false);
  });

  it("lets a second touch press cancel the first, so only one fires", () => {
    const { row, onLongPress } = mount();
    fireEvent.pointerDown(row, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS / 2);
    // A second finger, or a release the platform never sent.
    fireEvent.pointerDown(row, { ...touch, clientX: 30 });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("calls a drift of exactly the slop still a press", () => {
    const { row, onLongPress } = mount();
    fireEvent.pointerDown(row, touch);
    fireEvent.pointerMove(row, {
      ...touch,
      clientX: touch.clientX + LONG_PRESS_SLOP_PX,
    });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("claims no click while taps are not its handler's", () => {
    const claim = vi.fn(() => "row");
    const Untapped = () => {
      const gestures = useLongPress({ claim, onLongPress: () => undefined });
      return (
        // biome-ignore lint/a11y/useSemanticElements: the row under test is structure, as the table's is
        // biome-ignore lint/a11y/useFocusableInteractive: the gestures are an enhancement over the row's own controls
        <div role="row" {...gestures}>
          row
        </div>
      );
    };
    render(<Untapped />);
    fireEvent.click(screen.getByRole("row"));
    expect(claim).not.toHaveBeenCalled();
  });

  it("hands a press and a tap what the claim answered, and nothing unclaimed", () => {
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
