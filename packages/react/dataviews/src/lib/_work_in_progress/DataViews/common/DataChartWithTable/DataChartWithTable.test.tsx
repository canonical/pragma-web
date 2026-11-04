import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createFacetedFleet } from "../../../../../../testing/createFacetedProviders.js";
import silenceRenderErrors from "../../../../../../testing/silenceRenderErrors.js";
import DataViews from "../../Provider.js";
import DataChartWithTable from "./DataChartWithTable.js";

const chartProps = {
  type: "bar",
  field: "status",
  label: "Machines by status",
} as const;
const tableProps = {
  columns: [{ id: "name", header: "Host" }],
  label: "Machines",
} as const;

describe("DataViews DataChartWithTable", () => {
  it("draws the enclosing root's chart, with the table a press away", () => {
    render(
      <DataViews provider={createFacetedFleet()}>
        <DataChartWithTable chartProps={chartProps} tableProps={tableProps} />
      </DataViews>,
    );
    expect(
      screen.getByRole("figure", { name: "Machines by status" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Table", pressed: false }),
    ).toBeInTheDocument();
  });

  it("throws outside a DataViews root, naming the part", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <DataChartWithTable chartProps={chartProps} tableProps={tableProps} />,
      ),
    ).toThrow(
      "DataViews.DataChartWithTable must be used inside a DataViews root",
    );
  });
});
