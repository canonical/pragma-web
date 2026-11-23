/**
 * Regression: the More filters disclosure stays open for as long as its
 * placement is pinned.
 *
 * Before the fix, the pin copied the disclosure's open state, but the
 * disclosure was drawn only while it held a control and its open state was
 * the element's own. A query moving while it was open could leave nothing
 * inside — a choice whose options are the server's, once its facet listed
 * none — and the element left with no toggle, keeping the pin. It came back
 * closed under a placement still pinned open, where a restriction could be
 * placed out of sight. The disclosure is now open exactly while pinned, and
 * kept while pinned. A seen option now stays listed, so the test withdraws
 * the region's filter instead.
 */

import {
  createCollection,
  createDataViewsProvider,
  declareCapabilities,
} from "@canonical/dataviews-core";
import { createManualSource } from "@canonical/dataviews-core/testing";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  answerFacetValues,
  type FacetValue,
  type IdentifiedRecord as Placed,
  toggleDisclosure,
} from "../../../testing/index.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

const places = createCollection({
  identify: (row: Placed) => row.id,
  fields: [
    { field: "status", kind: "choices", options: ["failed", "ready"] },
    { field: "region", kind: "choices" },
  ],
});

/** The region facet listing one region. */
const ONE_REGION: readonly FacetValue[] = [
  { value: "eu", count: { kind: "exact", value: 1 } },
];

/** A provider over a source filtering `region` only if asked. */
const buildProvider = (filtersRegion: boolean) => {
  const manual = createManualSource<Placed>({
    capabilities: declareCapabilities(places, {
      filter: filtersRegion ? { status: true, region: true } : { status: true },
      facets: ["region"],
    }),
  });
  const provider = createDataViewsProvider({
    collection: places,
    source: manual.source,
    facets: ["region"],
  });
  return { manual, provider };
};

describe("regression 0039 — pin outlived the More filters disclosure", () => {
  it("keeps the disclosure open while its placement is pinned, whatever is left inside", async () => {
    const { manual, provider } = buildProvider(true);
    const { container, rerender } = render(
      <DataViews provider={provider}>
        <DataViews.Filters primary={["status"]} />
      </DataViews>,
    );
    answerFacetValues(manual, "region", ONE_REGION);
    await toggleDisclosure(container, true);
    rerender(
      <DataViews provider={buildProvider(false).provider}>
        <DataViews.Filters primary={["status"]} />
      </DataViews>,
    );
    // The region can no longer be filtered, so nothing is inside.
    expect(container.querySelector("details")?.open).toBe(true);
    // Closed, the pin is released, and a disclosure holding nothing leaves.
    await toggleDisclosure(container, false);
    expect(container.querySelector("details")).toBeNull();
  });
});
