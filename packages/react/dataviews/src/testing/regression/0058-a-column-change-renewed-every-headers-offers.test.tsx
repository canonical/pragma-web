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
 * A pass-through spy on the icon button counts Status's menu renders: a menu
 * given new offers renders again.
 */

import { installPopoverStandIn } from "@canonical/react-ds-global/testing";
import { act, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  buildMachine,
  createMachineProvider,
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

/** How often Status's menu rendered since the spy was last cleared. */
const countStatusRenders = (): number =>
  listHeaderMenuRenders().filter(
    (props) =>
      document.getElementById(String(props["aria-labelledby"]))?.textContent ===
      "Column options for Status",
  ).length;

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
        id="t"
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
      provider.presentation.arrange({ "table.t.width.name": 240 });
    });
    expect(countStatusRenders()).toBe(0);
    // Owner hidden: Cores is now last shown, and Status takes the same
    // changes as before.
    act(() => {
      provider.presentation.arrange({ "table.t.hidden": ["owner"] });
    });
    expect(countStatusRenders()).toBe(0);
    // Cores hidden too: Status is now last shown, and can move right no
    // more, so its menu renders its new offers.
    act(() => {
      provider.presentation.arrange({ "table.t.hidden": ["owner", "cores"] });
    });
    expect(countStatusRenders()).toBeGreaterThan(0);
  });
});
