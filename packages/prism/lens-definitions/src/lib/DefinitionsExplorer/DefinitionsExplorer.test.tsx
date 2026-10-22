/**
 * The explorer triptych's warm-store proof: the captured
 * `/definitions/ds%3AUIBlock` records render the rail's groups, the
 * well's node graph, and the inspector's class record WITHOUT the network
 * being consulted — with teeth, because the same render against an empty
 * store does hit the network exactly once (the one route operation).
 * The warm mount is consolidated (the full-triptych render is heavy) and
 * carries an explicit timeout for fully-parallel runs.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  UIBLOCK_TERM,
} from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";

/** A fetch spy that never settles: any call means "the network was hit". */
describe("DefinitionsExplorer against a warm store", () => {
  it("renders the triptych — rail groups, well nodes, inspector — with no fetch, selection marked", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(
      createDefinitionsPage(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );

    // The a11y floor: each panel announces itself.
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    expect(rail.getAttribute("data-slot")).toBe("explorer-rail");
    expect(
      screen.getByRole("complementary", { name: "Term inspector" }),
    ).toBeInTheDocument();

    // Rail: the three live ontologies, each a labelled group.
    for (const prefix of ["ds", "cs", "anatomy"]) {
      expect(screen.getByRole("region", { name: prefix })).toBeInTheDocument();
    }

    // Well + rail: "UI Block" appears as BOTH the rail item and the
    // well node — same term address, and both carry the router's
    // aria-current for the selected term.
    const uiBlockLinks = screen.getAllByRole("link", { name: "UI Block" });
    expect(uiBlockLinks.length).toBe(2);
    for (const link of uiBlockLinks) {
      expect(link.getAttribute("href")).toBe("/definitions/ds%3AUIBlock");
      expect(link.getAttribute("aria-current")).toBe("page");
    }

    // Inspector: the class record's fields.
    expect(
      screen.getByRole("heading", { level: 2, name: "UI Block" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/category of visual or abstract entity/),
    ).toBeInTheDocument();

    // …and the network was NEVER consulted.
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("has teeth: the same render against an empty store fetches once", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const fetchFn = createFetchSpy();
    render(createDefinitionsPage(UIBLOCK_TERM, undefined, fetchFn));

    expect(screen.getByText("Loading the ontologies…")).toBeInTheDocument();
    // The static lens marker still stands while the interior suspends.
    expect(
      screen.getByRole("heading", { level: 1, name: "Definitions" }),
    ).toBeInTheDocument();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
