/**
 * Selection mode was stated only while selection was offered, and a table
 * that stopped offering it kept the mode's own flag: offered again, with the
 * selection still standing, the table was back in the mode — stated, and
 * taking taps as toggles — with no press and no announcement.
 *
 * Withdrawing selection ends the mode itself, so selection offered again
 * starts outside it.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import readAnnouncements from "../../../testing/readAnnouncements.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";

const columns = [{ id: "name", header: "Name", rowHeader: true }];
const touch = { pointerType: "touch", clientX: 1, clientY: 1 };

describe("selection offered again after it was withdrawn in the mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts outside the mode, with the selection left as it stood", async () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha"), machine("m-2", "beta")],
    });
    const table = (selectable: boolean) => (
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        selectable={selectable}
      />
    );
    const view = render(table(true));
    const alpha = screen.getByRole("row", { name: "alpha" });
    fireEvent.pointerDown(alpha, touch);
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect(await readAnnouncements()).toHaveLength(1);
    view.rerender(table(false));
    view.rerender(table(true));
    expect(screen.getByRole("table")).not.toHaveAttribute(
      "data-selection-mode",
    );
    // Not the empty-selection path: the selection still stands.
    expect([...provider.selection.state.get().ids]).toEqual(["m-1"]);
    // A tap outside the mode toggles nothing.
    const beta = screen.getByRole("row", { name: "beta" });
    fireEvent.pointerDown(beta, touch);
    fireEvent.pointerUp(beta, touch);
    fireEvent.click(beta);
    expect([...provider.selection.state.get().ids]).toEqual(["m-1"]);
    expect(await readAnnouncements()).toEqual([
      "Selection mode: tap a row to select or deselect it.",
    ]);
  });
});
