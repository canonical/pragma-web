import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { useFragment } from "react-relay";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import { DEFINITIONS_TEST_TIMEOUT_MS } from "../../../../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import useCapturedExplorer from "../../../../../../testing/useCapturedExplorer.js";
import type { TermInspector_ontologies$key } from "../../../../../__generated__/TermInspector_ontologies.graphql.js";
import termInspectorOntologiesFragmentNode from "../../../../../__generated__/TermInspector_ontologies.graphql.js";
import { useLensFilter } from "../../../LensFilterProvider/index.js";
import { SPECIMENS } from "./constants.js";
import GraphOverview from "./GraphOverview.js";

/** The overview over the store, beside a readout of the asked region. */
function Overview(): ReactElement {
  const { data } = useCapturedExplorer();
  const ontologies = useFragment<TermInspector_ontologies$key>(
    termInspectorOntologiesFragmentNode,
    data.ontologies,
  );
  const { region } = useLensFilter();
  return (
    <>
      <output aria-label="Region">
        {region === undefined ? "all" : `${region.prefix} #${region.serial}`}
      </output>
      <GraphOverview
        className="custom-class"
        data-testid="overview"
        ontologies={ontologies}
      />
    </>
  );
}

/** Mount the overview over the captured store. */
function renderOverview(): HTMLElement {
  render(
    createStripHarness(
      "/definitions",
      definitionsExplorerRecords,
      createFetchSpy(),
      <Overview />,
    ),
  );
  return screen.getByTestId("overview");
}

describe("GraphOverview", { timeout: DEFINITIONS_TEST_TIMEOUT_MS }, () => {
  it("explains the graph with specimens drawn by the graph itself", () => {
    const overview = renderOverview();
    expect(overview.className).toBe("ds graph-overview custom-class");
    const entries = overview.querySelectorAll(".entry");
    expect(entries).toHaveLength(SPECIMENS.length);
    for (const entry of entries) {
      expect(entry.querySelector("svg .ds.class-graph")).not.toBeNull();
    }
    expect(entries.item(0).textContent).toContain(
      "A concrete class with its instance count",
    );
    // The hub specimen draws its hub alone.
    expect(entries.item(2).querySelectorAll(".node")).toHaveLength(1);
  });

  it("counts each namespace's classes, instances and relations", () => {
    const overview = renderOverview();
    const buttons = within(overview).getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Fit the graph to ds",
      "Fit the graph to cs",
      "Fit the graph to anatomy",
    ]);
    expect(buttons.at(1)?.textContent).toMatch(/^cs3 classes/);
  });

  it("asks the graph to fit the namespace a reader picks, each time", () => {
    const overview = renderOverview();
    const cs = within(overview).getByRole("button", {
      name: "Fit the graph to cs",
    });
    fireEvent.click(cs);
    expect(screen.getByRole("status", { name: "Region" }).textContent).toBe(
      "cs #1",
    );
    fireEvent.click(cs);
    expect(screen.getByRole("status", { name: "Region" }).textContent).toBe(
      "cs #2",
    );
  });

  it("says how to move about the graph", () => {
    const overview = renderOverview();
    expect(
      within(overview).getByRole("heading", { name: "Gestures" }),
    ).toBeInTheDocument();
  });
});
