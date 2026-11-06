/**
 * Regression: a press on a resize handle that does not travel fixes no
 * width, and a press then a press resizes the column without a drag.
 *
 * Before the fix, a press with no movement began a resize and its release
 * committed it, so one stray click on the handle wrote the column's current
 * width as a fixed override and a fluid column stopped growing. And the
 * only pointer path to another width was a drag, which WCAG 2.5.7 does not
 * accept as the only way. A press that does not travel now starts placing
 * the edge, and the next press in the header row puts it there.
 */

import { declareCapabilities } from "@canonical/dataviews-core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import machine from "../../../testing/machine.js";
import { machines } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mountTable = () => {
  const { provider } = createMachineProvider({
    rows: [machine("m-1", "alpha")],
    capabilities: declareCapabilities(machines, {}),
  });
  render(
    <DataTable
      provider={provider}
      columns={[
        {
          id: "name",
          header: "Name",
          resizable: true,
          sizing: { kind: "flex", weight: 1, minPx: 50, maxPx: 300 },
        },
        { id: "status", header: "Status" },
      ]}
      label="Machines"
    />,
  );
  return provider;
};

const readTracks = (): string =>
  screen
    .getByRole("table", { name: "Machines" })
    .style.getPropertyValue("--data-table-columns");

describe("regression 0122 — a press on the resize handle fixed the width", () => {
  it("fixes nothing for a press that does not travel", () => {
    const provider = mountTable();
    const before = provider.presentation.state.get().own;
    const handle = screen.getByRole("separator");
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    act(() => {
      fireEvent.pointerUp(window, { clientX: 100 });
    });
    expect(provider.presentation.state.get().own).toEqual(before);
    expect(handle.parentElement).toHaveAttribute("data-mode", "placing");
  });

  it("resizes to a second press in the header row", () => {
    mountTable();
    const handle = screen.getByRole("separator");
    const cell = screen.getAllByRole("columnheader").at(0) as HTMLElement;
    vi.spyOn(cell, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 96, height: 32 }),
    );
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 96 });
    act(() => {
      fireEvent.pointerUp(window, { clientX: 96 });
    });
    act(() => {
      fireEvent.pointerDown(screen.getByText("Status"), {
        isPrimary: true,
        clientX: 140,
      });
    });
    expect(readTracks()).toMatch(/^140px /);
    expect(handle.parentElement).not.toHaveAttribute("data-mode");
  });
});
