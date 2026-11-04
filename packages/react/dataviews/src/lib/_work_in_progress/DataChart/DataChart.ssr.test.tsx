/**
 * On the server the chart is drawn from the facets of the page the server
 * renders: an image named for what it shows and a table of its numbers,
 * counted or measured over the records matching the URL's query. A source
 * that cannot answer within the call renders the loading status and draws
 * nothing.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  createFacetedFleet,
  createFacetedManual,
} from "../../../../testing/createFacetedProviders.js";
import DataChart from "./DataChart.js";

describe("DataChart on the server", () => {
  it("draws the bars and their table from the facets of the URL's query", () => {
    const provider = createFacetedFleet({
      href: "/machines?status=failed&page=1&size=5",
    });
    provider.refresh();
    const markup = renderToString(
      <DataChart
        provider={provider}
        type="bar"
        field="status"
        label="Machines by status"
      />,
    );
    expect(markup).toContain('role="img"');
    expect(markup.match(/class="bar"/g)).toHaveLength(2);
    expect(markup).toContain('<th scope="row">failed</th><td>4</td>');
    expect(markup).toContain('<th scope="row">running</th><td>8</td>');
    expect(markup).not.toContain("Loading…");
  });

  it("draws the range and its table from the facets of the URL's query", () => {
    const provider = createFacetedFleet({ href: "/machines?status=failed" });
    provider.refresh();
    const markup = renderToString(
      <DataChart
        provider={provider}
        type="range"
        field="cores"
        label="Cores"
      />,
    );
    expect(markup).toContain('aria-label="Cores: a range chart from 3 to 12"');
    expect(markup).toContain('<th scope="row">Lowest</th><td>3</td>');
    expect(markup).toContain('<th scope="row">Highest</th><td>12</td>');
    expect(markup).not.toContain("Loading…");
  });

  it("renders the loading status when the source cannot answer within the call", () => {
    const { provider } = createFacetedManual();
    provider.refresh();
    const markup = renderToString(
      <DataChart
        provider={provider}
        type="bar"
        field="status"
        label="Machines by status"
      />,
    );
    expect(markup).toContain('data-status="pending"');
    expect(markup).not.toContain("<svg");
    expect(markup).not.toContain("<table");
  });
});
