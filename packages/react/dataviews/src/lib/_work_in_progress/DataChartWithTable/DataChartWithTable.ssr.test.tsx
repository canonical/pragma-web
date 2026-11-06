/**
 * Without scripts there is nothing to choose with, so the server draws both
 * the chart and the table, each in a region named for it, and no button.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFacetedFleet from "../../../../testing/createFacetedFleet.js";
import DataChartWithTable from "./DataChartWithTable.js";

describe("DataChartWithTable on the server", () => {
  it("draws the chart and then the table, each named, and offers no choice", () => {
    const provider = createFacetedFleet();
    provider.refresh();
    const markup = renderToString(
      <DataChartWithTable
        provider={provider}
        chartProps={{
          type: "bar",
          field: "status",
          label: "Machines by status",
        }}
        tableProps={{
          columns: [{ id: "name", header: "Host" }],
          label: "Machines",
        }}
      />,
    );
    const regions = markup.split('data-renderer="').slice(1);
    expect(regions).toHaveLength(2);
    const [chart = "", table = ""] = regions;
    expect(chart).toMatch(/^chart" aria-label="Chart"/);
    expect(chart).toContain("<figure");
    expect(table).toMatch(/^table" aria-label="Table"/);
    expect(table).toContain('aria-label="Machines"');
    expect(markup).not.toContain("aria-pressed");
    expect(markup).not.toContain('role="group"');
  });
});
