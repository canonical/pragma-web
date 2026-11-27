/**
 * Regression: a table not given its settings drew an empty, unnamed settings
 * cell.
 *
 * Before the fix, the header's settings cell was drawn whenever the table's
 * children were not undefined, so the ordinary conditional
 * `{canConfigure && <DataTable.SettingsMenu />}` left an empty column header and
 * reserved the settings track for it. The cell is now filled by the named
 * `settings` prop, which is typed to take an element or nothing, and is drawn
 * only for a valid element, so the same conditional passed from untyped code
 * draws nothing either.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildMachine, createMachineProvider } from "../../../testing/index.js";
import { DataTable } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";

describe("regression 0052 — a false child drew an empty settings cell", () => {
  it("draws no settings cell for a conditional that renders nothing, typed or not", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
    });
    const canConfigure = (): boolean => false;
    const { container } = render(
      <DataTable
        id="t"
        provider={provider}
        columns={[{ id: "name", header: "Name" }]}
        label="Machines"
        settings={canConfigure() ? <DataTable.SettingsMenu /> : undefined}
      />,
    );
    // The children's conditional, carried over to the prop from untyped
    // code: false is no element, and draws no cell either.
    const untyped = render(
      <DataTable
        id="t"
        provider={provider}
        columns={[{ id: "name", header: "Name" }]}
        label="Machines"
        // @ts-expect-error — a conditional's false is no element.
        settings={canConfigure() && <DataTable.SettingsMenu />}
      />,
    );
    expect(
      untyped.container.querySelector(".ds.data-table-settings-cell"),
    ).toBeNull();
    expect(container.querySelector(".ds.data-table-settings-cell")).toBeNull();
    expect(container.querySelectorAll("th")).toHaveLength(1);
  });
});
