/**
 * Regression: a change to one column handed every header's menu new offers.
 *
 * Before the fix, each column's offers were built afresh whenever the
 * arrangement changed — widths included — by running every column command
 * for every column, and a hide or a move gave every header a new offers
 * object, so every column's menu rendered again though its own changes had
 * not moved. Offers are now read from one resolution of the arrangement, and
 * a column keeps its offers object while its changes hold.
 *
 * The open menu is counted by a pass-through counter on the open menu's
 * list, as regression 0014 counts it: a menu given new offers renders again.
 */

import { act, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  installPopoverStandIn,
  openMenuFrom,
} from "../../../testing/index.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import MenuList from "../../lib/common/DropdownButtonStandIn/common/MenuList/MenuList.js";

// Each call of the spied list is a render of the open column menu.
vi.mock(
  "../../lib/common/DropdownButtonStandIn/common/MenuList/MenuList.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../lib/common/DropdownButtonStandIn/common/MenuList/MenuList.js")
      >();
    return { default: vi.fn(actual.default) };
  },
);

const renders = vi.mocked(MenuList);

describe("regression 0058 — a column change renewed every header's offers", () => {
  let uninstallPopovers: () => void;
  beforeAll(() => {
    uninstallPopovers = installPopoverStandIn();
  });
  afterAll(() => {
    uninstallPopovers();
  });

  it("renders no open menu whose column's changes hold, through a width and a hide elsewhere", async () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
    });
    render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name" },
          { id: "status", header: "Status" },
          { id: "cores", header: "Cores" },
          { id: "owner", header: "Owner" },
        ]}
        label="Machines"
      />,
    );
    await openMenuFrom(
      screen.getByRole("button", { name: "Column options for Status" }),
    );
    renders.mockClear();
    act(() => {
      provider.presentation.arrange({ "table.width.name": 240 });
    });
    expect(renders).not.toHaveBeenCalled();
    // Owner hidden: Cores is now last shown, and Status takes the same
    // changes as before.
    act(() => {
      provider.presentation.arrange({ "table.hidden": ["owner"] });
    });
    expect(renders).not.toHaveBeenCalled();
    // Cores hidden too: Status is now last shown, and can move right no
    // more, so its menu renders its new offers.
    act(() => {
      provider.presentation.arrange({ "table.hidden": ["owner", "cores"] });
    });
    expect(renders).toHaveBeenCalled();
  });
});
