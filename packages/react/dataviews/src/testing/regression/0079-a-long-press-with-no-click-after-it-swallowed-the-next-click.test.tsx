/**
 * A long press set a flag the click following its release cleared. On the
 * platforms that send no click after a held touch, the flag stood until the
 * next click of any kind on the row — a mouse on a hybrid device, or a
 * keyboard's click on a link in a cell — which was then swallowed as the
 * press's, and every context menu on the row suppressed until then.
 *
 * The flag is let go a tick after the release: the compat click, where a
 * platform sends one, is dispatched before any timer runs.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";
import useLongPress from "../../lib/hooks/useLongPress.js";

const Pressable = ({ onTap }: { readonly onTap: () => void }) => {
  const gestures = useLongPress({
    claim: () => "row",
    onLongPress: () => undefined,
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

describe("a long press the platform sends no click after", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("swallows no later click, and holds no context menu off", () => {
    const onTap = vi.fn();
    render(<Pressable onTap={onTap} />);
    const row = screen.getByRole("row");
    fireEvent.pointerDown(row, {
      pointerType: "touch",
      clientX: 1,
      clientY: 1,
    });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    fireEvent.pointerUp(row, { pointerType: "touch" });
    // No click follows the release. A tick later the press is over.
    vi.advanceTimersByTime(0);
    expect(fireEvent.contextMenu(row)).toBe(true);
    fireEvent.pointerDown(row, {
      pointerType: "mouse",
      clientX: 1,
      clientY: 1,
    });
    fireEvent.click(row);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it("still swallows the click that follows the release at once", () => {
    const onTap = vi.fn();
    render(<Pressable onTap={onTap} />);
    const row = screen.getByRole("row");
    fireEvent.pointerDown(row, {
      pointerType: "touch",
      clientX: 1,
      clientY: 1,
    });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    fireEvent.pointerUp(row, { pointerType: "touch" });
    fireEvent.click(row);
    expect(onTap).not.toHaveBeenCalled();
  });
});
