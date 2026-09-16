/**
 * Whether the table was in selection mode was handed to every row as a prop,
 * though no row draws it: the mode is stated on the table, and a row read it
 * only to decide what a tap does. Entering or leaving the mode therefore
 * rendered every row and every cell again, for a value none of them shows.
 *
 * The table decides what a tap does, and no row is told the mode.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import type { DisplayFieldCellProps } from "../../lib/common/index.js";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";

describe("entering selection mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders no cell again", () => {
    const renders: string[] = [];
    const Probe = ({ rowId }: DisplayFieldCellProps) => {
      renders.push(rowId);
      return <>{rowId}</>;
    };
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha"), machine("m-2", "beta")],
    });
    render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name", rowHeader: true },
          { id: "status", header: "Status", cell: Probe },
        ]}
        label="Machines"
        selectable
      />,
    );
    renders.length = 0;
    const row = screen.getByRole("row", { name: "beta" });
    fireEvent.pointerDown(row, {
      pointerType: "touch",
      clientX: 1,
      clientY: 1,
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect(screen.getByRole("table")).toHaveAttribute(
      "data-selection-mode",
      "true",
    );
    // The pressed row's own selection moved; no cell draws that.
    expect(renders).toEqual([]);
  });
});
