import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { createFacetedFleet } from "../../../../testing/createFacetedProviders.js";
import type { DataTableColumn } from "../DataTable/index.js";
import DataChartWithTable from "./DataChartWithTable.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
];

/** The chart and its table over a fleet whose source counts the status. */
const mount = () =>
  render(
    <DataChartWithTable
      provider={createFacetedFleet()}
      chartProps={{ type: "bar", field: "status", label: "Machines by status" }}
      tableProps={{ columns, label: "Machines", selectable: true }}
    />,
  );

describe("DataChartWithTable", () => {
  it("shows the chart by default, its button pressed", () => {
    mount();
    expect(
      screen.getByRole("figure", { name: "Machines by status" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chart", pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Table", pressed: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Chart" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Table" })).toBeNull();
  });

  it("draws the table in place of the chart when Table is pressed, keeping the focus on it", () => {
    mount();
    const table = screen.getByRole("button", { name: "Table" });
    table.focus();
    fireEvent.click(table);
    const region = screen.getByRole("region", { name: "Table" });
    expect(
      within(region).getByRole("table", { name: "Machines" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("figure")).toBeNull();
    expect(table).toHaveAttribute("aria-pressed", "true");
    expect(table).toHaveFocus();
  });

  it("keeps a row selected in the table across a trip to the chart", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select m-001" }));
    fireEvent.click(screen.getByRole("button", { name: "Chart" }));
    expect(screen.queryByRole("table", { name: "Machines" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    expect(
      screen.getByRole("checkbox", { name: "Select m-001" }),
    ).toBeChecked();
  });

  it("draws a range through the chart's own props", () => {
    render(
      <DataChartWithTable
        provider={createFacetedFleet()}
        chartProps={{ type: "range", field: "cores", label: "Cores" }}
        tableProps={{ columns, label: "Machines" }}
      />,
    );
    expect(
      screen.getByRole("img", { name: "Cores: a range chart from 1 to 12" }),
    ).toBeInTheDocument();
  });

  it("draws the counts and their numbers table where the source counts the field", () => {
    mount();
    expect(
      screen.getByRole("img", {
        name: "Machines by status: a bar chart of how many records hold each value",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", { name: "Machines by status, as a table" }),
    ).toBeInTheDocument();
  });

  it("speaks the application's words for both buttons and the group", () => {
    render(
      <DataChartWithTable
        provider={createFacetedFleet()}
        chartProps={{
          type: "bar",
          field: "status",
          label: "Machines by status",
        }}
        tableProps={{ columns, label: "Machines" }}
        messages={{
          renderer: "Afficher comme",
          chartRenderer: "Graphique",
          tableRenderer: "Tableau",
        }}
      />,
    );
    const group = screen.getByRole("group", { name: "Afficher comme" });
    expect(
      within(group)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Graphique", "Tableau"]);
  });

  it("names its group by its label where one is given", () => {
    render(
      <DataChartWithTable
        provider={createFacetedFleet()}
        chartProps={{
          type: "bar",
          field: "status",
          label: "Machines by status",
        }}
        tableProps={{ columns, label: "Machines" }}
        label="Show machines as"
      />,
    );
    expect(
      screen.getByRole("group", { name: "Show machines as" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Show machines as" }),
    ).toBeInTheDocument();
  });

  it("passes the caller's class and native props to its root section", () => {
    const ref = createRef<HTMLElement>();
    render(
      <DataChartWithTable
        provider={createFacetedFleet()}
        chartProps={{
          type: "bar",
          field: "status",
          label: "Machines by status",
        }}
        tableProps={{ columns, label: "Machines" }}
        className="mine"
        data-testid="switch"
        ref={ref}
      />,
    );
    const root = screen.getByTestId("switch");
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveClass(
      "ds",
      "renderer-switch",
      "data-chart-with-table",
      "mine",
    );
    expect(root).toHaveAccessibleName("Show as");
    expect(ref.current).toBe(root);
  });
});
