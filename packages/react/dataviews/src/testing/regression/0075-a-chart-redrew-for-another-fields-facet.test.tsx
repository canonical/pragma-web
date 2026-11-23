/**
 * A source mints a fresh facet for every request, and the provider keeps the
 * whole record only while every field's facet is unchanged — so a result that
 * moved the cores range handed the status chart a new facet object saying
 * exactly what the old one said, and the chart redrew every bar for it. The
 * chart holds its own facet by what it claims, not by its identity.
 *
 * The drawing is counted by a pass-through counter: the real memo, its
 * drawing spied, so every call is a render that got past the memo and still
 * draws. Nothing the DOM shows can tell a redraw with identical output from
 * no redraw at all.
 */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createFacetedManual, deliverFacets } from "../../../testing/index.js";
import BarDrawing from "../../lib/_work_in_progress/DataChart/common/BarDrawing/BarDrawing.js";
import { DataChart } from "../../lib/_work_in_progress/DataChart/index.js";

const draws = vi.spyOn(BarDrawing, "type");

/** One status facet, minted fresh each time, saying the same thing. */
const buildStatusFacet = () =>
  ({
    kind: "values",
    values: [{ value: "failed", count: { kind: "exact", value: 4 } }],
  }) as const;

describe("regression 0075 — a chart redrew for another field's facet", () => {
  it("redraws no bar of the chart that reads this one", () => {
    const { provider, source } = createFacetedManual();
    render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    deliverFacets(source, {
      status: buildStatusFacet(),
      cores: { kind: "range", min: 1, max: 8 },
    });
    expect(draws).toHaveBeenCalledTimes(1);

    provider.refresh();
    // The same status counts, in a new object, beside a range that moved.
    deliverFacets(source, {
      status: buildStatusFacet(),
      cores: { kind: "range", min: 1, max: 16 },
    });
    expect(draws).toHaveBeenCalledTimes(1);

    provider.refresh();
    // A status count that actually moved draws again.
    deliverFacets(source, {
      status: {
        kind: "values",
        values: [{ value: "failed", count: { kind: "exact", value: 5 } }],
      },
      cores: { kind: "range", min: 1, max: 16 },
    });
    expect(draws).toHaveBeenCalledTimes(2);
  });
});
