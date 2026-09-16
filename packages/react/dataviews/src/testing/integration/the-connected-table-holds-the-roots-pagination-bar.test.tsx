/**
 * The connected table places the root's pagination bar in its footer, and
 * holds the caller's footer over it, or none for null. It speaks through the
 * root's announcer, so its root holds no live region of its own.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

const columns = [
  { id: "name", header: "Name" },
  { id: "status", header: "Status" },
];

const rows = [machine("m-1", "alpha")];

/** The table's root around the one table on screen. */
const frameOf = (): HTMLElement => {
  const frame = screen.getByRole("table", { name: "Machines" }).parentElement;
  if (frame === null) {
    throw new Error("the table stands in no root");
  }
  return frame;
};

describe("the connected table's footer", () => {
  it("holds the root's pagination bar unless told otherwise", () => {
    const { provider } = createMachineProvider({ rows });
    render(
      <DataViews provider={provider}>
        <DataViews.DataTable columns={columns} label="Machines" />
      </DataViews>,
    );
    expect(frameOf().querySelector(":scope > .footer")).toContainElement(
      screen.getByRole("navigation", { name: "Pagination" }),
    );
    // The root's announcer, not one of the table's own, so the frame holds
    // no live region.
    expect(frameOf().querySelector(".ds.data-views-announcer")).toBeNull();
  });

  it("holds the caller's footer over the bar, and none for null", () => {
    const { provider } = createMachineProvider({ rows });
    const { unmount } = render(
      <DataViews provider={provider}>
        <DataViews.DataTable
          columns={columns}
          label="Machines"
          footer={<p>own</p>}
        />
      </DataViews>,
    );
    expect(frameOf().querySelector(":scope > .footer")).toHaveTextContent(
      "own",
    );
    expect(screen.queryByRole("navigation")).toBeNull();
    unmount();
    render(
      <DataViews provider={provider}>
        <DataViews.DataTable columns={columns} label="Machines" footer={null} />
        <DataViews.Pagination />
      </DataViews>,
    );
    expect(frameOf().querySelector(":scope > .footer")).toBeNull();
    // The bar the caller placed itself stands where it was placed.
    expect(screen.getByRole("navigation", { name: "Pagination" })) //
      .toBeInTheDocument();
  });
});
