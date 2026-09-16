/**
 * A long press let its fired state go a tick after its release. Hiding the
 * pressed element in an Activity, or StrictMode's re-run of effects, tore the
 * effects down between the release and that tick: the timer was cleared but
 * its marker stood, so no later release scheduled the reset, and every later
 * click on the element was swallowed as the press's and its context menu
 * held off.
 *
 * Tearing the effects down lets the press go entirely.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { Activity, type ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";
import useLongPress from "../../lib/hooks/useLongPress.js";

const Pressable = ({ onTap }: { readonly onTap: () => void }): ReactElement => {
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

describe("a fired press whose element is hidden before its release is let go", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("swallows no later click", () => {
    const onTap = vi.fn();
    const view = render(
      <Activity mode="visible">
        <Pressable onTap={onTap} />
      </Activity>,
    );
    const row = screen.getByRole("row", { hidden: true });
    fireEvent.pointerDown(row, {
      pointerType: "touch",
      clientX: 1,
      clientY: 1,
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    fireEvent.pointerUp(row, { pointerType: "touch" });
    // Hidden and shown again before the release's tick: effects torn down
    // and set up again.
    view.rerender(
      <Activity mode="hidden">
        <Pressable onTap={onTap} />
      </Activity>,
    );
    view.rerender(
      <Activity mode="visible">
        <Pressable onTap={onTap} />
      </Activity>,
    );
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(fireEvent.contextMenu(row)).toBe(true);
    // A click with no press before it, as keyboard activation sends: only
    // the press's own end can have let it through.
    fireEvent.click(row);
    expect(onTap).toHaveBeenCalledTimes(1);
  });
});
