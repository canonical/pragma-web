/**
 * A column declared the row's header: its cell is the row header, the row is
 * named by it, and so is the row's checkbox unless the caller names the row.
 * One per table, and never hidden.
 */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import expectNoAxeViolations from "../../../../testing/expectNoAxeViolations.js";
import { pageOf } from "../../../../testing/fixtures.js";
import {
  createMachineProvider,
  type Machine,
  type MachineFields,
  machine,
} from "../../../../testing/machines.js";
import silenceRenderErrors from "../../../../testing/silenceRenderErrors.js";
import DataTable from "./DataTable.js";
import type { DataTableColumn } from "./types.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name", rowHeader: true },
  { id: "status", header: "Status" },
];

const fleet: readonly Machine[] = [
  machine("m-1", "alpha"),
  machine("m-2", "beta", "failed"),
];

/** A table whose source answers every request at once with `rows`. */
const loadedTable = (
  rows: readonly Machine[] = fleet,
  extra: Partial<Parameters<typeof DataTable<MachineFields, Machine>>[0]> = {},
) => {
  const { provider } = createMachineProvider({ rows });
  render(
    <DataTable
      provider={provider}
      columns={columns}
      label="Machines"
      {...extra}
    />,
  );
  return provider;
};

describe("a column declared the row header", () => {
  it("renders its cell as the row's header, and names the row by it", () => {
    loadedTable();
    const headers = screen.getAllByRole("rowheader");
    expect(headers.map((header) => header.textContent)).toEqual([
      "alpha",
      "beta",
    ]);
    expect(headers.at(0)).toHaveClass(
      "ds",
      "data-table-body-cell",
      "row-header",
    );
    const alpha = screen.getByRole("row", { name: "alpha" });
    expect(alpha).toContainElement(headers.at(0) ?? null);
    // The row's other cells stay cells.
    expect(
      within(alpha)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["running"]);
  });

  it("leaves a row named by all its cells where no column is the row header", () => {
    loadedTable(fleet, {
      columns: [
        { id: "name", header: "Name" },
        { id: "status", header: "Status" },
      ],
    });
    expect(screen.queryByRole("rowheader")).toBeNull();
    // A row's name is its content: every cell's, since none is its header.
    expect(screen.queryByRole("row", { name: "alpha" })).toBeNull();
    expect(screen.getByRole("row", { name: /^alpha\s?running$/ })) //
      .toBeInTheDocument();
  });

  it("names a row's checkbox by its header's text", () => {
    loadedTable(fleet, { selectable: true });
    expect(
      screen.getByRole("checkbox", { name: "Select alpha" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Select beta" }),
    ).toBeInTheDocument();
  });

  it("names a row's checkbox by the caller's label over its header", () => {
    loadedTable(fleet, {
      selectable: true,
      rowLabel: (row, rowId) => `${row.name} (${rowId})`,
    });
    expect(
      screen.getByRole("checkbox", { name: "Select alpha (m-1)" }),
    ).toBeInTheDocument();
  });

  it("names a row's checkbox by its identity where its header shows no text", () => {
    loadedTable([machine("m-1", "  ")], { selectable: true });
    expect(
      screen.getByRole("checkbox", { name: "Select m-1" }),
    ).toBeInTheDocument();
  });

  it("names a row's checkbox by its identity where no column is the row header", () => {
    loadedTable(fleet, {
      selectable: true,
      columns: [{ id: "name", header: "Name" }],
    });
    expect(
      screen.getByRole("checkbox", { name: "Select m-1" }),
    ).toBeInTheDocument();
  });

  it("refuses two columns each declared the row header, where it mounts", () => {
    silenceRenderErrors();
    expect(() =>
      loadedTable(fleet, {
        columns: [
          { id: "name", header: "Name", rowHeader: true },
          { id: "status", header: "Status", rowHeader: true },
        ],
      }),
    ).toThrow(
      'DataTable columns "name" and "status" are each the row header; a row has one',
    );
  });

  it("offers no hiding of the row header, whatever it declared", () => {
    loadedTable(fleet, {
      columns: [
        { id: "name", header: "Name", rowHeader: true, hideable: true },
        { id: "status", header: "Status" },
      ],
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Column options for Name" }),
    );
    // A column that may not be hidden is offered no Hide, only its moves.
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Move column left", "Move column right"]);
  });

  it("has no axe violation, selectable", async () => {
    loadedTable(fleet, { selectable: true });
    await expectNoAxeViolations(screen.getByRole("table"));
  });

  it("renames a row's checkbox when the header's text or the caller's label moves", () => {
    for (const labelled of [false, true]) {
      const { provider, source } = createMachineProvider();
      const view = render(
        <DataTable
          provider={provider}
          columns={columns}
          label="Machines"
          selectable
          {...(labelled
            ? { rowLabel: (row: Machine) => `host ${row.name}` }
            : {})}
        />,
      );
      const deliver = (name: string) => {
        act(() => {
          source.latest().deliver({
            status: "succeeded",
            page: pageOf([machine("m-1", name)]),
          });
        });
      };
      deliver("alpha");
      act(() => {
        provider.refresh();
      });
      deliver("gamma");
      expect(
        screen.getByRole("checkbox", {
          name: labelled ? "Select host gamma" : "Select gamma",
        }),
      ).toBeInTheDocument();
      view.unmount();
    }
  });
});
