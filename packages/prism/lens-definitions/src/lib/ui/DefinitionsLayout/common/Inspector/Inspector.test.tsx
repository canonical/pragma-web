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
});
