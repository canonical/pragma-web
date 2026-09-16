/**
 * Selection mode ended when a selection publication found the selection
 * empty, once its subscription was taken. A table no longer offering
 * selection, or one whose selection was emptied before the subscription
 * began, kept the mode — its attribute and its tap-to-toggle — standing.
 *
 * The mode ends with selection withdrawn, and reads the selection as it
 * stands when it subscribes.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";

const columns = [{ id: "name", header: "Name", rowHeader: true }];

describe("selection mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ends when the table stops offering selection", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    const view = render(
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        selectable
      />,
    );
    fireEvent.pointerDown(screen.getByRole("row", { name: "alpha" }), {
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
    view.rerender(
      <DataTable provider={provider} columns={columns} label="Machines" />,
    );
    expect(screen.getByRole("table")).not.toHaveAttribute(
      "data-selection-mode",
    );
  });
});
