import { createGraphBudget, GraphBudgetProvider } from "@canonical/prism-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import { DEFINITIONS_TEST_TIMEOUT_MS } from "../../../../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../../../../testing/records/definitionsExplorerRecords.js";
import { Inspector } from "./index.js";

describe("Inspector", () => {
  it("inspects the route's term from the warm store, with no fetch", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(
      createStripHarness(
        "/definitions/ds%3AUIBlock",
        definitionsExplorerRecords,
        fetchFn,
        <Inspector />,
      ),
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "UI Block" }),
    ).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("shows the graph's overview on the explorer", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createStripHarness(
        "/definitions",
        definitionsExplorerRecords,
        createFetchSpy(),
        <Inspector />,
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Reading the graph" }),
    ).toBeInTheDocument();
  });

  /** The rows that open their namespace, at an address, within 20 nodes. */
  const listOpenRows = (url: string): string[] => {
    // Within 20 nodes the largest namespace, ds with 20 classes, is a box.
    const { unmount } = render(
      <GraphBudgetProvider budget={createGraphBudget({ drawnNodesMax: 20 })}>
        {createStripHarness(
          url,
          definitionsExplorerRecords,
          createFetchSpy(),
          <Inspector />,
        )}
      </GraphBudgetProvider>,
    );
    const opens = screen
      .queryAllByRole("link", { name: /^Open / })
      .map((link) => new URL(link.getAttribute("href") ?? "", "http://site"))
      .map((href) => href.searchParams.get("expand") ?? "");
    expect(
      screen.getAllByRole("button", { name: /^Fit the graph to / }),
    ).toHaveLength(3);
    unmount();
    return opens;
  };

  it("opens each namespace the map draws as a box from its row, at rest and opened", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    expect(listOpenRows("/definitions")).toEqual(["ds"]);
    // Opened, ds keeps its fit button and opens no more; the rest are
    // boxes, each opened from its row.
    expect(listOpenRows("/definitions?expand=ds")).toEqual(["cs", "anatomy"]);
  });
});
