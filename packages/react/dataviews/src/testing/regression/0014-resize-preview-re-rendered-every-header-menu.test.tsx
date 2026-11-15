/**
 * Regression: a live resize renders no header menu again.
 *
 * Before the fix, every frame of a column resize re-rendered the table's
 * header row, and each sortable header's menu with it — the menu handed a
 * new callback on every render — so a wide table paid a whole menu's hooks
 * per column per frame of the drag.
 *
 * The design system's menu is a pass-through counter: a spy that runs the
 * real menu on every render and counts the calls. React offers no
 * per-component render count to read otherwise, so the module is replaced
 * at the package boundary with the real one, its menu spied.
 */

import { ContextualMenu } from "@canonical/react-ds-global";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import declareMachineOrdering from "../../../testing/declareMachineOrdering.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

// Each call of the spied menu is a render of a column's menu.
vi.mock("@canonical/react-ds-global", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@canonical/react-ds-global")>();
  return { ...actual, ContextualMenu: vi.fn(actual.ContextualMenu) };
});

const renders = vi.mocked(ContextualMenu);

describe("regression 0014 — a resize preview re-rendered every header menu", () => {
  it("renders no opened menu again for a resize step", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      capabilities: declareMachineOrdering(null),
    });
    render(
      <DataTable
        provider={provider}
        columns={[
          {
            id: "name",
            header: "Name",
            sortable: true,
            resizable: true,
            sizing: { kind: "flex", weight: 1, minPx: 50 },
          },
          { id: "status", header: "Status", sortable: true },
        ]}
        label="Machines"
      />,
    );
    // Status's menu stays open through the resize: a closed menu is only its
    // button, so an open one is the menu a resize could render again.
    fireEvent.click(
      screen.getByRole("button", { name: "Column options for Status" }),
    );
    expect(screen.getByRole("menu", { hidden: true })).toBeInTheDocument();
    expect(renders).toHaveBeenCalled();
    const readTracks = () =>
      screen
        .getByRole("table", { name: "Machines" })
        .style.getPropertyValue("--data-table-columns");
    const before = readTracks();
    renders.mockClear();
    // The resize handle, named for its column: the open menu draws a
    // separator of its own between the sort and the column's place.
    fireEvent.keyDown(screen.getByRole("separator", { name: "Name" }), {
      key: "ArrowRight",
    });
    // The geometry moved, and not one menu rendered for it.
    expect(readTracks()).not.toBe(before);
    expect(screen.getByRole("menu", { hidden: true })).toBeInTheDocument();
    expect(renders).not.toHaveBeenCalled();
  });
});
