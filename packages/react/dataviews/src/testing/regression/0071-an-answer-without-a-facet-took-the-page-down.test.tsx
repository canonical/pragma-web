/**
 * A source may answer a page without the facet it was asked for. The charts
 * threw then, blaming the provider's configuration, so a page that rendered
 * on the server took the whole tree down once that answer arrived in the
 * browser. The answer is said, not thrown: what no mounting check could have
 * caught is a state to draw.
 */

import { createPage } from "@canonical/dataviews-core";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import createFacetedManual from "../../../testing/createFacetedManual.js";
import { DataChart } from "../../lib/_work_in_progress/DataChart/index.js";

/** Answer the source's latest request with a page carrying no facet at all. */
const answerWithoutFacets = (
  source: ReturnType<typeof createFacetedManual>["source"],
): void => {
  act(() => {
    source.latest().deliver({
      status: "succeeded",
      page: createPage({
        rows: [buildMachine("m-1", "alpha")],
        matched: 1,
        total: 1,
        facets: {},
      }),
    });
  });
};

describe("a chart answered without its facet", () => {
  it("says the source counted nothing, and does not throw", () => {
    const { provider, source } = createFacetedManual();
    render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    answerWithoutFacets(source);
    expect(
      screen.getByText("The source answered no counts for this field."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("says the source measured nothing, and does not throw", () => {
    const { provider, source } = createFacetedManual();
    render(
      <DataChart
        type="range"
        provider={provider}
        field="cores"
        label="Cores"
      />,
    );
    answerWithoutFacets(source);
    expect(
      screen.getByText("The source answered no range for this field."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
