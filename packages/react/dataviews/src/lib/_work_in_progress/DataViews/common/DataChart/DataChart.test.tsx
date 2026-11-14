import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createFacetedFleet } from "../../../../../../testing/createFacetedProviders.js";
import silenceRenderErrors from "../../../../../../testing/silenceRenderErrors.js";
import DataViews from "../../Provider.js";
import DataChart from "./DataChart.js";

describe("DataViews DataChart", () => {
  it("draws the enclosing root's counts as bars", () => {
    render(
      <DataViews provider={createFacetedFleet()}>
        <DataChart type="bar" field="status" label="Machines by status" />
      </DataViews>,
    );
    expect(
      screen.getByRole("figure", { name: "Machines by status" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("draws the enclosing root's range", () => {
    render(
      <DataViews provider={createFacetedFleet()}>
        <DataChart type="range" field="cores" label="Cores" />
      </DataViews>,
    );
    expect(screen.getByRole("figure", { name: "Cores" })).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("throws outside a DataViews root, naming the part", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <DataChart type="bar" field="status" label="Machines by status" />,
      ),
    ).toThrow("DataViews.DataChart must be used inside a DataViews root");
  });
});
