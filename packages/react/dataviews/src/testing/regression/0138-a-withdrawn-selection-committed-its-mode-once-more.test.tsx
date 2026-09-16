/**
 * Selection mode followed the `selectable` prop through an effect: a table
 * that stopped offering selection committed and painted once more with the
 * mode stated on it and no gesture to act on it, then rendered again to end
 * it.
 *
 * The mode is derived as the table renders, so withdrawing selection is one
 * commit, which states no mode.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { Profiler, type ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";

const columns = [{ id: "name", header: "Name", rowHeader: true }];

describe("withdrawing selection in selection mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("commits once, with no mode stated", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    const commits: (string | null)[] = [];
    const Host = ({ selectable }: { readonly selectable: boolean }) => (
      <Profiler
        id="table"
        onRender={() => {
          commits.push(
            document
              .querySelector("[role='table']")
              ?.getAttribute("data-selection-mode") ?? null,
          );
        }}
      >
        <DataTable
          provider={provider}
          columns={columns}
          label="Machines"
          selectable={selectable}
        />
      </Profiler>
    );
    const view = render(<Host selectable />);
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
    commits.length = 0;
    view.rerender((<Host selectable={false} />) as ReactElement);
    expect(commits.length).toBeGreaterThan(0);
    expect(commits).not.toContain("true");
  });
});
