/**
 * The frame around the table: the caller's box, holding the table, a footer
 * beneath it and outside the table role, and a standalone table's announcer.
 * The connected table fills the footer with the root's pagination bar unless
 * told otherwise.
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import expectNoAxeViolations from "../../../../testing/expectNoAxeViolations.js";
import {
  createMachineProvider,
  type Machine,
  machine,
} from "../../../../testing/machines.js";
import { DataViews } from "../DataViews/index.js";
import DataTable from "./DataTable.js";
import type { DataTableColumn } from "./types.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name" },
  { id: "status", header: "Status" },
];

const rows: readonly Machine[] = [machine("m-1", "alpha")];

/** The frame around the one table on screen. */
const frameOf = (): HTMLElement => {
  const frame = screen.getByRole("table", { name: "Machines" }).parentElement;
  if (frame === null) {
    throw new Error("the table stands in no frame");
  }
  return frame;
};

describe("the table's frame", () => {
  it("holds the table, and nothing of the table's own", () => {
    const { provider } = createMachineProvider({ rows });
    render(
      <DataTable provider={provider} columns={columns} label="Machines" />,
    );
    const frame = frameOf();
    expect(frame).toHaveClass("ds", "data-table-frame");
    expect(frame).not.toHaveAttribute("role");
    expect(frame.querySelector(".ds.data-table-footer")).toBeNull();
    // The table's children are its row groups: nothing else stands in it.
    expect(
      [...screen.getByRole("table").children].map((child) =>
        child.getAttribute("role"),
      ),
    ).toEqual(["rowgroup", "rowgroup"]);
  });

  it("places the footer beneath the table, outside its role", () => {
    const { provider } = createMachineProvider({ rows });
    render(
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        footer={<nav aria-label="Pages">pages</nav>}
      />,
    );
    const frame = frameOf();
    const footer = frame.querySelector(".ds.data-table-footer");
    expect(footer).toContainElement(
      screen.getByRole("navigation", { name: "Pages" }),
    );
    // After the table, and not among its rows.
    expect(screen.getByRole("table").nextElementSibling).toBe(footer);
    expect(
      within(screen.getByRole("table")).queryByRole("navigation"),
    ).toBeNull();
  });

  it("places a standalone table's announcer in the frame, after the footer", () => {
    const { provider } = createMachineProvider({ rows });
    render(
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        footer={<p>pages</p>}
      />,
    );
    const frame = frameOf();
    const announcer = frame.querySelector(".ds.data-views-announcer");
    expect(announcer).not.toBeNull();
    expect(frame.querySelector(".ds.data-table-footer")?.nextElementSibling) //
      .toBe(announcer);
  });

  it("has no axe violation with a footer", async () => {
    const { provider } = createMachineProvider({ rows });
    const { container } = render(
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        footer={<nav aria-label="Pages">pages</nav>}
      />,
    );
    await expectNoAxeViolations(container);
  });
});

describe("the connected table's footer", () => {
  it("holds the root's pagination bar unless told otherwise", () => {
    const { provider } = createMachineProvider({ rows });
    render(
      <DataViews provider={provider}>
        <DataViews.DataTable columns={columns} label="Machines" />
      </DataViews>,
    );
    expect(frameOf().querySelector(".ds.data-table-footer")).toContainElement(
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
    expect(frameOf().querySelector(".ds.data-table-footer")).toHaveTextContent(
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
    expect(frameOf().querySelector(".ds.data-table-footer")).toBeNull();
    // The bar the caller placed itself stands where it was placed.
    expect(screen.getByRole("navigation", { name: "Pagination" })) //
      .toBeInTheDocument();
  });
});
