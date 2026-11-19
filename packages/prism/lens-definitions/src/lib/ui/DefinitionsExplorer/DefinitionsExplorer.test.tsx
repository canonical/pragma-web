/**
 * The explorer over the captured store: the rail and the graph read one
 * layout of the same operation, with no fetch while the store is warm, and
 * the search box dims both.
 */

import { createGraphBudget, GraphBudgetProvider } from "@canonical/prism-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  UIBLOCK_TERM,
} from "../../../../testing/fixtures.js";
import patchRecords from "../../../../testing/patchRecords.js";
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
    // At rest ds is one box; its class's page draws the class's one-hop
    // neighbourhood: 14 classes, no box and no stub.
    expect(
      container.querySelectorAll('.desktop .node[data-kind="region"]'),
    ).toHaveLength(0);
    expect(
      container.querySelectorAll(
        '.desktop .node:not([data-kind="stub"]):not([data-kind="region"])',
      ),
    ).toHaveLength(14);
    expect(
      container.querySelectorAll('.desktop .node[data-kind="stub"]'),
    ).toHaveLength(0);
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
    fireEvent.change(field, { target: { value: "  Switch " } });
    expect(field).toHaveValue("  Switch ");
    expect(
      container.querySelector('.desktop .node[data-id="anatomy:Edge"]'),
    ).toHaveClass("is-dimmed");
    expect(
      container.querySelector('.desktop .node[data-id="anatomy:Switch"]'),
    ).not.toHaveClass("is-dimmed");
    expect(
      container
        .querySelector('.explorer-rail a[href="/definitions/anatomy%3AEdge"]')
        ?.closest("li"),
    ).toHaveClass("is-dimmed");
    // The rail dims the classes a box stands for as well.
    expect(
      container
        .querySelector('.explorer-rail a[href="/definitions/ds%3AComponent"]')
        ?.closest("li"),
    ).toHaveClass("is-dimmed");
  });

  it("draws an empty explorer for ontologies with no class", () => {
    const empty = { classes: { __refs: [] }, properties: { __refs: [] } };
    const { container } = render(
      createDefinitionsPage(
        undefined,
        patchRecords(definitionsExplorerRecords, {
          "client:root:ontologies:0": empty,
          "client:root:ontologies:1": empty,
          "client:root:ontologies:2": empty,
        }),
        createFetchSpy(),
      ),
    );
    expect(container.querySelector(".ds.definitions-explorer")).not.toBeNull();
    expect(container.querySelectorAll(".desktop .node")).toHaveLength(0);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("draws every class of a fragment whose superclass chain loops", () => {
    const countDrawn = (records: typeof definitionsExplorerRecords): number => {
      const { container, unmount } = render(
        createDefinitionsPage(UIBLOCK_TERM, records, createFetchSpy()),
      );
      const drawn = container.querySelectorAll(
        '.desktop .node:not([data-kind="stub"])',
      ).length;
      unmount();
      return drawn;
    };
    expect(
      countDrawn(
        patchRecords(definitionsExplorerRecords, {
          "client:root:ontologies:0:classes:1:superclass": {
            uri: "https://ds.canonical.com/ConceptType",
          },
        }),
      ),
    ).toBe(countDrawn(definitionsExplorerRecords));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("suspends over a cold store and fetches the one operation", () => {
    const fetchFn = createFetchSpy();
    render(createDefinitionsPage(UIBLOCK_TERM, undefined, fetchFn));
    expect(screen.getByText("Loading the ontologies…")).toBeInTheDocument();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("lays the graph out within the site's budget: the rail, the canvas and the phone draw a collapsed namespace as one row", () => {
    // Within 20 nodes the largest namespace, ds with 20 classes, collapses.
    const { container } = render(
      <GraphBudgetProvider budget={createGraphBudget({ drawnNodesMax: 20 })}>
        {createDefinitionsPage(
          undefined,
          definitionsExplorerRecords,
          createFetchSpy(),
        )}
      </GraphBudgetProvider>,
    );
    const box = container.querySelector(
      '.desktop .node[data-kind="region"][data-id="ds"]',
    );
    expect(box?.getAttribute("data-classes")).toBe("20");
    // The box states the relations figure the inspector's row states for
    // ds (its 21 object properties), not only those drawn inside it.
    const name =
      box?.getAttribute("aria-label") ??
      box?.querySelector("a")?.getAttribute("aria-label");
    expect(name).toMatch(/20 classes, \d+ instances, 21 relations,/);
    expect(
      container.querySelectorAll('.desktop .node:not([data-kind="stub"])'),
    ).toHaveLength(16);
    // The rail still lists every class of ds, each a link to its term,
    // under a heading that says the graph draws them as one box; its
    // search counts them all.
    const rail = screen.getByRole("region", { name: "ds" });
    const [classList] = rail.querySelectorAll(".list");
    expect(
      classList?.querySelectorAll('.item a[href^="/definitions/ds%3A"]'),
    ).toHaveLength(20);
    expect(rail.querySelector(".subheading .boxed")?.textContent).toBe(
      "drawn as one box",
    );
    expect(rail.querySelector(".subheading .count")?.textContent).toBe(
      "20 of 20",
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "Filter terms" }), {
      target: { value: "concept" },
    });
    expect(rail.querySelector(".subheading .count")?.textContent).toBe(
      "2 of 20",
    );
    expect(
      [...(classList?.querySelectorAll(".item:not(.is-dimmed) a") ?? [])].map(
        (link) => link.textContent,
      ),
    ).toEqual(["Concept", "Concept Type"]);
    expect(
      container.querySelector('.phone .row[data-kind="region"]')?.textContent,
    ).toContain("20 classes");
  });
  it("draws a term page of a class inside a collapsed namespace: the class drawn, focused and the tab stop", () => {
    // Within 20 nodes ds collapses at rest; its class's page draws the
    // class's neighbourhood, which holds no box.
    const { container } = render(
      <GraphBudgetProvider budget={createGraphBudget({ drawnNodesMax: 20 })}>
        {createDefinitionsPage(
          UIBLOCK_TERM,
          definitionsExplorerRecords,
          createFetchSpy(),
        )}
      </GraphBudgetProvider>,
    );
    const desktop = container.querySelector(".desktop");
    expect(desktop?.querySelectorAll('.node[data-kind="region"]')).toHaveLength(
      0,
    );
    const block = desktop?.querySelector('.node[data-id="ds:UIBlock"]');
    expect(block).not.toBeNull();
    expect(block?.classList.contains("is-faded")).toBe(false);
    expect(block?.querySelector(".ring.is-selected")).not.toBeNull();
    const stops = desktop?.querySelectorAll('a[tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops?.[0]?.closest(".node")?.getAttribute("data-id")).toBe(
      "ds:UIBlock",
    );
  });

  it("splits a band fuller than the budget's on a term page's neighbourhood", () => {
    // Within 20 nodes ds collapses at rest; its class's page draws its 14
    // neighbours, whose fullest layer the band of 4 splits.
    const countBand = (band: number): number => {
      const { container, unmount } = render(
        <GraphBudgetProvider
          budget={createGraphBudget({
            drawnNodesMax: 20,
            bandMembersMax: band,
          })}
        >
          {createDefinitionsPage(
            UIBLOCK_TERM,
            definitionsExplorerRecords,
            createFetchSpy(),
          )}
        </GraphBudgetProvider>,
      );
      const columns = new Map<string, number>();
      for (const node of container.querySelectorAll(".desktop g.node")) {
        const col = node.getAttribute("data-col") ?? "";
        columns.set(col, (columns.get(col) ?? 0) + 1);
      }
      expect(
        container.querySelector('.desktop .node[data-id="ds:UIBlock"]'),
      ).not.toBeNull();
      unmount();
      return Math.max(...columns.values());
    };
    expect(countBand(12)).toBeGreaterThan(4);
    expect(countBand(4)).toBe(4);
  });

  it("puts the graph's tab stop on the first class drawn when the rail opens on a box", () => {
    const { container } = render(
      <GraphBudgetProvider budget={createGraphBudget({ drawnNodesMax: 20 })}>
        {createDefinitionsPage(
          undefined,
          definitionsExplorerRecords,
          createFetchSpy(),
        )}
      </GraphBudgetProvider>,
    );
    const desktop = container.querySelector(".desktop");
    const stops = desktop?.querySelectorAll('a[tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops?.[0]?.closest(".node")?.getAttribute("data-kind")).not.toBe(
      "region",
    );
    expect(desktop?.querySelectorAll(".node.is-faded")).toHaveLength(0);
  });
});
