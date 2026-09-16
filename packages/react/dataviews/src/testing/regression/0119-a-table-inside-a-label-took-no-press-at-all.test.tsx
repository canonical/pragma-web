/**
 * A press or a tap on a row is left to a control it lands on, and the search
 * for that control ran up past the row to the document. A table placed
 * inside a label, an editable region or an option took every press as one
 * on a control: long press and selection mode silently did nothing.
 *
 * Only a control within the row is the row's.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";

describe("a table inside a label", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("still takes a long press on a row", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    render(
      // biome-ignore lint/a11y/noLabelWithoutControl: the table is what sits inside the label, as an application might nest it
      <label>
        <DataTable
          provider={provider}
          columns={[{ id: "name", header: "Name", rowHeader: true }]}
          label="Machines"
          selectable
        />
      </label>,
    );
    fireEvent.pointerDown(screen.getByRole("row", { name: "alpha" }), {
      pointerType: "touch",
      clientX: 1,
      clientY: 1,
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect([...provider.selection.state.get().ids]).toEqual(["m-1"]);
  });
});
