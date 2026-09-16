/**
 * A long press anywhere on a row selected it. Held on the row's own
 * checkbox, the press selected the row and the click the release produced
 * reached the checkbox, whose own change deselected it again and ended the
 * mode it had just entered.
 *
 * A press that begins on one of the row's controls is that control's, and
 * the row starts none.
 */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";

describe("a long press begun on the row's checkbox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is the checkbox's alone: the row enters no mode for it", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    render(
      <DataTable
        provider={provider}
        columns={[{ id: "name", header: "Name", rowHeader: true }]}
        label="Machines"
        selectable
      />,
    );
    const row = screen.getByRole("row", { name: "alpha" });
    const checkbox = within(row).getByRole("checkbox");
    fireEvent.pointerDown(checkbox, {
      pointerType: "touch",
      clientX: 1,
      clientY: 1,
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect(screen.getByRole("table")).not.toHaveAttribute(
      "data-selection-mode",
    );
    expect([...provider.selection.state.get().ids]).toEqual([]);
    // The checkbox's own click, as the release produces it, toggles once.
    fireEvent.pointerUp(checkbox, { pointerType: "touch" });
    fireEvent.click(checkbox);
    expect([...provider.selection.state.get().ids]).toEqual(["m-1"]);
  });
});
