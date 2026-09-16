/**
 * The row header the rows are handed was read from the column model, which
 * is held while the columns' ids, fields and sizing stay the same. Moving
 * `rowHeader` from one column to another changes none of those, so the rows
 * kept the old header: the old column still named each row.
 *
 * The header is read from the rendered list, which is held by every member
 * the rendered tree reads, `rowHeader` among them.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

describe("the row header moved to another column", () => {
  it("names each row by the new column", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha", "failed")],
    });
    const view = render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name", rowHeader: true },
          { id: "status", header: "Status" },
        ]}
        label="Machines"
      />,
    );
    expect(screen.getByRole("rowheader")).toHaveTextContent("alpha");
    view.rerender(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name" },
          { id: "status", header: "Status", rowHeader: true },
        ]}
        label="Machines"
      />,
    );
    expect(screen.getByRole("rowheader")).toHaveTextContent("failed");
    expect(screen.getByRole("row", { name: "failed" })).toBeInTheDocument();
  });
});
