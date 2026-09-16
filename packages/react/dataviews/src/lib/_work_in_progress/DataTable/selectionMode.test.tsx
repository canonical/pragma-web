/**
 * Selection on touch: a long press on a row selects it and puts the table in
 * selection mode, where a tap toggles a row; the last row deselected ends
 * the mode. Entering and leaving are announced, the mode is a state
 * attribute on the table, and the row checkbox stays the baseline path.
 */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pageOf } from "../../../../testing/fixtures.js";
import {
  createMachineProvider,
  type Machine,
  machine,
} from "../../../../testing/machines.js";
import readAnnouncements from "../../../../testing/readAnnouncements.js";
import { LONG_PRESS_MS } from "../../hooks/constants.js";
import DataTable from "./DataTable.js";
import type { DataTableColumn } from "./types.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name", rowHeader: true },
  { id: "status", header: "Status" },
];

const fleet: readonly Machine[] = [
  machine("m-1", "alpha"),
  machine("m-2", "beta", "failed"),
];

const touch = { pointerType: "touch", clientX: 10, clientY: 10 };

const rowNamed = (name: string): HTMLElement =>
  screen.getByRole("row", { name });

/** Hold a touch on the row for the long-press delay. */
const longPress = (row: HTMLElement): void => {
  fireEvent.pointerDown(row, touch);
  act(() => {
    vi.advanceTimersByTime(LONG_PRESS_MS);
  });
  fireEvent.pointerUp(row, touch);
  fireEvent.click(row);
};

/** Tap the row: a touch released at once, then the click it produces. */
const tap = (row: HTMLElement): void => {
  fireEvent.pointerDown(row, touch);
  fireEvent.pointerUp(row, touch);
  fireEvent.click(row);
};

const loadedTable = (selectable = true) => {
  const { provider } = createMachineProvider({ rows: fleet });
  render(
    <DataTable
      provider={provider}
      columns={columns}
      label="Machines"
      selectable={selectable}
    />,
  );
  return provider;
};

const selectedIds = (
  provider: ReturnType<typeof createMachineProvider>["provider"],
) => [...provider.selection.state.get().ids].sort();

describe("selection mode on touch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("selects a long-pressed row and enters the mode, announced and stated", async () => {
    const provider = loadedTable();
    const table = screen.getByRole("table");
    expect(table).not.toHaveAttribute("data-selection-mode");
    longPress(rowNamed("alpha"));
    expect(selectedIds(provider)).toEqual(["m-1"]);
    expect(table).toHaveAttribute("data-selection-mode", "true");
    expect(rowNamed("alpha")).toHaveAttribute("aria-selected", "true");
    expect(await readAnnouncements()).toEqual([
      "Selection mode: tap a row to select or deselect it.",
    ]);
  });

  it("toggles a tapped row while in the mode, and leaves a tap on a control to it", async () => {
    const provider = loadedTable();
    longPress(rowNamed("alpha"));
    tap(rowNamed("beta"));
    expect(selectedIds(provider)).toEqual(["m-1", "m-2"]);
    tap(rowNamed("beta"));
    expect(selectedIds(provider)).toEqual(["m-1"]);
    // The checkbox answers for itself: the row does not also toggle.
    const checkbox = within(rowNamed("beta")).getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(selectedIds(provider)).toEqual(["m-1", "m-2"]);
    expect(await readAnnouncements()).toHaveLength(1);
  });

  it("ends the mode when the last selected row is deselected, announced", async () => {
    const provider = loadedTable();
    longPress(rowNamed("alpha"));
    // A moment later, so leaving is its own announcement and not one with
    // entering.
    expect(await readAnnouncements()).toHaveLength(1);
    tap(rowNamed("alpha"));
    expect(selectedIds(provider)).toEqual([]);
    expect(screen.getByRole("table")).not.toHaveAttribute(
      "data-selection-mode",
    );
    expect(await readAnnouncements()).toEqual([
      "Selection mode: tap a row to select or deselect it.",
      "Selection mode ended.",
    ]);
    // Out of the mode, a tap toggles nothing.
    tap(rowNamed("beta"));
    expect(selectedIds(provider)).toEqual([]);
  });

  it("ends the mode when the selection is cleared from elsewhere", () => {
    const provider = loadedTable();
    longPress(rowNamed("alpha"));
    act(() => {
      provider.selection.clear();
    });
    expect(screen.getByRole("table")).not.toHaveAttribute(
      "data-selection-mode",
    );
  });

  it("holds the mode while a long press adds a row already in it", async () => {
    const provider = loadedTable();
    longPress(rowNamed("alpha"));
    longPress(rowNamed("beta"));
    expect(selectedIds(provider)).toEqual(["m-1", "m-2"]);
    // Entered once, said once.
    expect(await readAnnouncements()).toHaveLength(1);
  });

  it("does nothing on a table that is not selectable", () => {
    const provider = loadedTable(false);
    longPress(rowNamed("alpha"));
    expect(selectedIds(provider)).toEqual([]);
    expect(screen.getByRole("table")).not.toHaveAttribute(
      "data-selection-mode",
    );
  });

  it("does nothing for a mouse held on a row", () => {
    const provider = loadedTable();
    fireEvent.pointerDown(rowNamed("alpha"), {
      pointerType: "mouse",
      clientX: 10,
      clientY: 10,
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect(selectedIds(provider)).toEqual([]);
    expect(screen.getByRole("table")).not.toHaveAttribute(
      "data-selection-mode",
    );
  });

  it("selects nothing when the pressed row leaves before the press is long", () => {
    const { provider, source } = createMachineProvider();
    render(
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        selectable
      />,
    );
    const deliver = (rows: readonly Machine[]) => {
      act(() => {
        source.latest().deliver({ status: "succeeded", page: pageOf(rows) });
      });
    };
    deliver(fleet);
    fireEvent.pointerDown(rowNamed("alpha"), touch);
    act(() => {
      provider.refresh();
    });
    deliver([machine("m-2", "beta", "failed")]);
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect(selectedIds(provider)).toEqual([]);
    expect(screen.getByRole("table")).not.toHaveAttribute(
      "data-selection-mode",
    );
  });
});
