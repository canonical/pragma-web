/**
 * Each row ran its own long-press gesture — refs, handlers and an unmount
 * effect apiece — and minted fresh handlers on every render, for a gesture
 * only ever live on one row at a time, and whether or not the table offered
 * selection at all.
 *
 * The table holds one gesture over its body and finds the row a press
 * landed on by its id; a press on the header, or on a row of a table nested
 * in a cell, is not this table's row.
 */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";

const calls = vi.hoisted(() => ({ count: 0 }));

vi.mock("../../lib/hooks/useLongPress.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../lib/hooks/useLongPress.js")>();
  return {
    default: (...args: Parameters<typeof actual.default>) => {
      calls.count += 1;
      return actual.default(...args);
    },
  };
});

const touch = { pointerType: "touch", clientX: 1, clientY: 1 };

describe("the long press over a table's rows", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    calls.count = 0;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is one gesture for the table, not one per row", () => {
    const rows = Array.from({ length: 100 }, (_, index) =>
      machine(`m-${index}`, `host-${index}`),
    );
    const { provider } = createMachineProvider({ rows });
    render(
      <DataTable
        provider={provider}
        columns={[{ id: "name", header: "Name", rowHeader: true }]}
        label="Machines"
        selectable
      />,
    );
    // One call per render of the table, however many rows it holds.
    expect(calls.count).toBeGreaterThan(0);
    expect(calls.count).toBeLessThan(rows.length);
  });

  it("selects nothing for a press on the header, and leaves a nested selectable table's row to it", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    const { provider: inner } = createMachineProvider({
      rows: [machine("n-1", "inner")],
    });
    const Nested = () => (
      <DataTable
        provider={inner}
        columns={[{ id: "name", header: "Inner name", rowHeader: true }]}
        label="Inner"
        selectable
      />
    );
    render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name", rowHeader: true },
          { id: "status", header: "Status", cell: Nested },
        ]}
        label="Machines"
        selectable
      />,
    );
    const outer = screen.getByRole("table", { name: "Machines" });
    fireEvent.pointerDown(
      within(outer).getAllByRole("row").at(0) ?? outer,
      touch,
    );
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    const nested = screen.getByRole("table", { name: "Inner" });
    fireEvent.pointerDown(within(nested).getByRole("row", { name: "inner" }), {
      ...touch,
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    // The nested table answers for its own row; the outer table for none.
    expect([...inner.selection.state.get().ids]).toEqual(["n-1"]);
    expect([...provider.selection.state.get().ids]).toEqual([]);
    expect(outer).not.toHaveAttribute("data-selection-mode");
  });
});
