/**
 * Without scripts there is nothing to choose with, so the server draws the
 * chart, the default, alone in a region named for it, and no button.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFacetedFleet from "../../../../testing/createFacetedFleet.js";
import DataChartWithTable from "./DataChartWithTable.js";

describe("DataChartWithTable on the server", () => {
  it("draws the chart alone, named, and offers no choice", () => {
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
    expect(regions).toHaveLength(1);
    const [chart = ""] = regions;
    expect(chart).toMatch(/^chart" aria-label="Chart"/);
    expect(chart).toContain("<figure");
    expect(markup).not.toContain('aria-label="Machines"');
    expect(markup).not.toContain("aria-pressed");
    expect(markup).not.toContain('role="group"');
  });
});
