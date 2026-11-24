/**
 * Regression: a live resize renders no header menu again.
 *
 * Before the fix, every frame of a column resize re-rendered the table's
 * header row, and each sortable header's menu with it — the menu handed a
 * new callback on every render — so a wide table paid a whole menu's hooks
 * per column per frame of the drag.
 *
 * Each header menu is counted by a pass-through spy on its icon button
 * module, as React offers no per-component render count.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  declareMachineOrdering,
  installPopoverStandIn,
  openMenuFrom,
} from "../../../testing/index.js";
import IconButtonStandIn from "../../lib/common/IconButtonStandIn/IconButtonStandIn.js";
import { DataTable } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";

// Each call of the spy is a render of a header menu's icon button, which
// renders whenever its HeaderMenu does.
vi.mock(
  "../../lib/common/IconButtonStandIn/IconButtonStandIn.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../lib/common/IconButtonStandIn/IconButtonStandIn.js")
      >();
    return { default: vi.fn(actual.default) };
  },
);

const renders = vi.mocked(IconButtonStandIn);

/** The renders of header menus, as the props each was given. */
const listHeaderMenuRenders = () =>
  renders.mock.calls
    .map(([props]) => props)
    .filter((props) => props.className?.includes("data-table-header-menu"));

describe("regression 0014 — a resize preview re-rendered every header menu", () => {
  let uninstallPopovers: () => void;
  beforeAll(() => {
    uninstallPopovers = installPopoverStandIn();
  });
  afterAll(() => {
    uninstallPopovers();
  });

  it("renders no header menu again for a resize step", async () => {
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
    // Status's menu stays open through the resize.
    await openMenuFrom(
      screen.getByRole("button", { name: "Column options for Status" }),
    );
    expect(listHeaderMenuRenders()).not.toHaveLength(0);
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
    expect(listHeaderMenuRenders()).toHaveLength(0);
  });
});
