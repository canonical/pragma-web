/**
 * The explorer over the captured store: the rail and the graph read one
 * layout of the same operation, with no fetch while the store is warm, and
 * the search box dims both.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  UIBLOCK_TERM,
} from "../../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";

describe("DefinitionsExplorer", {
  timeout: DEFINITIONS_TEST_TIMEOUT_MS,
}, () => {
  it("draws the rail and the graph from the warm store, the selection current in both", () => {
    const fetchFn = createFetchSpy();
    const { container } = render(
      createDefinitionsPage(UIBLOCK_TERM, definitionsExplorerRecords, fetchFn),
    );
    const explorer = container.querySelector(".ds.definitions-explorer");
    expect(
      explorer?.querySelector(".ds.term-rail.explorer-rail"),
    ).not.toBeNull();
    expect(
      explorer?.querySelector(".ds.hierarchy-well.explorer-well"),
    ).not.toBeNull();
    for (const prefix of ["ds", "cs", "anatomy"]) {
      expect(screen.getByRole("region", { name: prefix })).toBeInTheDocument();
    }
    expect(container.querySelectorAll(".desktop .node")).toHaveLength(35);
    const current = screen
      .getAllByRole("link", { current: "page" })
      .map((link) => link.getAttribute("href"));
    expect(new Set(current)).toEqual(new Set(["/definitions/ds%3AUIBlock"]));
    expect(current.length).toBeGreaterThanOrEqual(2);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("dims the rail and the graph as the reader searches, and keeps the raw text", () => {
    const { container } = render(
      createDefinitionsPage(
        undefined,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const field = screen.getByRole("searchbox", { name: "Filter terms" });
    fireEvent.change(field, { target: { value: "  Tag " } });
    expect(field).toHaveValue("  Tag ");
    expect(
      container.querySelector('.desktop .node[data-id="ds:Component"]'),
    ).toHaveClass("is-dimmed");
    expect(
      container.querySelector('.desktop .node[data-id="ds:Tag"]'),
    ).not.toHaveClass("is-dimmed");
    expect(
      screen.getByRole("link", { name: "Component" }).closest("li"),
    ).toHaveClass("is-dimmed");
  });

  it("suspends over a cold store and fetches the one operation", () => {
    const fetchFn = createFetchSpy();
    render(createDefinitionsPage(UIBLOCK_TERM, undefined, fetchFn));
    expect(screen.getByText("Loading the ontologies…")).toBeInTheDocument();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
