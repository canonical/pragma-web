/**
 * The connected table: the DataTable, bound to the enclosing root's
 * provider. The table's own behaviour is pinned beside it; this pins the
 * binding, which is the whole of the part.
 */
import { buildPage } from "@canonical/dataviews-core/testing";
import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  machines,
} from "../../../../../../../testing/index.js";
import DataViews from "../../../Provider.js";
import DataTable from "./ConnectedDataTable.js";
import { createColumns, type DataTableColumn } from "./index.js";

const columns: readonly DataTableColumn[] = [{ id: "name", header: "Name" }];

describe("DataViews.DataTable", () => {
  it("is reachable as the composition's DataTable part", () => {
    expect(DataViews.DataTable).toBe(DataTable);
  });

  it("fails clearly outside a DataViews root", () => {
    expect(() =>
      render(<DataTable id="t" columns={columns} label="Machines" />),
    ).toThrow("DataViews.DataTable must be used inside a DataViews root");
  });

  it("renders the root's rows and takes the table's props, less the provider", () => {
    const { provider, source } = createMachineProvider();
    render(
      <DataViews provider={provider}>
        <DataTable id="t" columns={columns} label="Machines" className="rows" />
      </DataViews>,
    );
    // The root observed the provider, which asked the source for its page.
    expect(source.calls).toHaveLength(1);
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m1", "alpha")]),
      });
    });
    const table = screen.getByRole("table", { name: "Machines" });
    expect(table).toHaveClass("ds", "data-table", "rows");
    expect(screen.getByRole("cell", { name: "alpha" })).toBeInTheDocument();
  });

  it.fails("frames the table with no footer and no announcer of its own", () => {
    const { provider } = createMachineProvider();
    render(
      <DataViews provider={provider}>
        <DataTable columns={columns} label="Machines" />
      </DataViews>,
    );
    const frame = screen.getByRole("table", { name: "Machines" }).parentElement;
    if (!(frame instanceof HTMLElement)) {
      throw new Error("expected the frame");
    }
    expect(frame).toHaveClass("ds", "data-table-frame");
    expect(frame.children).toHaveLength(1);
  });

  it.fails("draws the footer it is given beneath the table", () => {
    const { provider } = createMachineProvider();
    render(
      <DataViews provider={provider}>
        <DataTable
          columns={columns}
          label="Machines"
          footer={<DataViews.Pagination />}
        />
      </DataViews>,
    );
    const table = screen.getByRole("table", { name: "Machines" });
    const footer = table.nextElementSibling;
    if (!(footer instanceof HTMLElement)) {
      throw new Error("expected a footer after the table");
    }
    expect(footer).toHaveClass("footer");
    expect(within(footer).getByRole("navigation")).toHaveClass(
      "ds",
      "data-table-pagination-bar",
    );
    expect(footer.nextElementSibling).toBeNull();
  });

  it("names each row from a record typed by its columns", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m1", "alpha")],
    });
    render(
      <DataViews provider={provider}>
        <DataTable
          columns={createColumns({
            collection: machines,
            columns: [{ field: "name", header: "Name" }],
          })}
          label="Machines"
          selectable
          getRowLabel={(row) => `${row.name}, ${row.cores} cores`}
        />
      </DataViews>,
    );
    expect(
      screen.getByRole("checkbox", { name: "Select alpha, 4 cores" }),
    ).toBeInTheDocument();
  });

  it("shows a source's synchronous answer on the render after its effect", () => {
    const { provider, source } = createMachineProvider({
      rows: [buildMachine("m1", "alpha"), buildMachine("m2", "beta")],
    });
    render(
      <DataViews provider={provider}>
        <DataTable id="t" columns={columns} label="Machines" />
      </DataViews>,
    );
    expect(screen.getByRole("cell", { name: "alpha" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "beta" })).toBeInTheDocument();
    // The table inside the root observes too; the ref-count keeps it to one run.
    expect(source.calls).toHaveLength(1);
  });
});
