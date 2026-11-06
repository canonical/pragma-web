import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createMachineProvider,
  machine,
  machines,
} from "../../../../../../testing/machines.js";
import silenceRenderErrors from "../../../../../../testing/silenceRenderErrors.js";
import { DataViews } from "../../../DataViews/index.js";
import ConnectedRecordList from "./ConnectedRecordList.js";

describe("ConnectedRecordList", () => {
  it("lists the enclosing root's rows, sharing its selection", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha"), machine("m-2", "beta")],
    });
    render(
      <DataViews provider={provider}>
        <ConnectedRecordList
          collection={machines}
          label="Machines"
          nameRecord={(record) => record.name}
          selectable
        />
        <DataViews.DataTable
          columns={[{ id: "name", header: "Name" }]}
          label="Machine table"
          selectable
          rowLabel={(row) => String(row["name"])}
        />
      </DataViews>,
    );
    const list = within(screen.getByRole("region", { name: "Machines" }));
    fireEvent.click(list.getByRole("checkbox", { name: "Select beta" }));
    const table = within(screen.getByRole("table", { name: "Machine table" }));
    expect(table.getByRole("checkbox", { name: "Select beta" })).toBeChecked();
    expect(provider.selection.state.get().ids.has("m-2")).toBe(true);
  });

  it("throws outside a DataViews root", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <ConnectedRecordList
          collection={machines}
          label="Machines"
          nameRecord={(record) => record.name}
        />,
      ),
    ).toThrow("useDataViews must be used inside a DataViews root");
  });
});
