// Scaffolded by @canonical/summon-component:react v0.46.0

import { setPrefetchEnvironment } from "@canonical/prism-core";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import renderLensPage from "../../../../../testing/renderLensPage.js";
import startMetroGraph from "../../../../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../../../../testing/types.js";

let graph: MetroGraph;

beforeAll(async () => {
  graph = await startMetroGraph();
});

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

afterAll(() => graph.close());

/** The page's passages, once the results have answered. */
const findPassages = async (): Promise<string[]> => {
  await waitFor(() =>
    expect(
      document.querySelectorAll(".ds.search-page .result .passage").length,
    ).toBeGreaterThan(0),
  );
  return [...document.querySelectorAll(".ds.search-page .result .passage")].map(
    (passage) => passage.textContent ?? "",
  );
};

describe("SearchPage", () => {
  it("names the page in its one heading", async () => {
    renderLensPage("/search?q=northgate", graph.url);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Search" }),
    ).toBeInTheDocument();
  });

  it.each(["northgate", "Platform", "the"])(
    "gives every result for %s a passage that holds it, in at most 160 characters (W8-A7)",
    async (text) => {
      renderLensPage(`/search?q=${text}`, graph.url);
      const passages = await findPassages();
      for (const passage of passages) {
        expect(passage.toLowerCase()).toContain(text.toLowerCase());
        expect(passage.length).toBeLessThanOrEqual(160);
      }
    },
  );

  it("renders each result through the site's chip switch", async () => {
    renderLensPage("/search?q=northgate", graph.url);
    await findPassages();
    const results = document.querySelectorAll(".ds.search-page .result");
    for (const result of results) {
      expect(result.firstElementChild?.className).toMatch(/\b[a-z-]+-chip\b/);
    }
  });

  it("counts the results in its summary", async () => {
    renderLensPage("/search?q=northgate", graph.url);
    expect(await screen.findByText(/^\d+ results?$/)).toBeInTheDocument();
  });

  it("says nothing matches a text no node holds, and lists nothing", async () => {
    renderLensPage("/search?q=zzzz", graph.url);
    expect(
      await screen.findByText(/^Nothing matches “.+”\.$/),
    ).toBeInTheDocument();
    expect(document.querySelector(".ds.search-page .results")).toBeNull();
  });

  it("gives each Type facet the provider's total for the text with it applied (W8-A6)", async () => {
    renderLensPage("/search?q=the", graph.url);
    await findPassages();
    const facets = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        ".ds.filter-bar .ds.type-facet-bar .value a",
      ),
    ].map((link) => ({
      href: link.getAttribute("href") ?? "",
      count: link.querySelector(".count")?.textContent ?? "",
    }));
    expect(facets.length).toBeGreaterThan(1);
    for (const { href, count } of facets) {
      cleanup();
      renderLensPage(href, graph.url);
      expect(
        await screen.findByText(
          new RegExp(`^${count} results?$`),
          {},
          { timeout: 5000 },
        ),
      ).toBeInTheDocument();
    }
  });

  it("renders no result through the generic Node chip (W8-A8)", async () => {
    renderLensPage("/search?q=the", graph.url);
    await findPassages();
    for (const result of document.querySelectorAll(".ds.search-page .result")) {
      expect(result.firstElementChild?.classList.contains("node-chip")).toBe(
        false,
      );
    }
  });

  it("pages the results by 20, linking the next page with its cursor (W8-A9)", async () => {
    renderLensPage("/search?q=e", graph.url);
    await findPassages();
    const total = Number(
      (await screen.findByText(/^\d+ results?$/)).textContent?.split(" ")[0],
    );
    expect(total).toBeGreaterThan(20);
    expect(document.querySelectorAll(".ds.search-page .result")).toHaveLength(
      20,
    );
    const bar = document.querySelector(".ds.search-page .ds.pagination-bar");
    expect(bar?.textContent).toContain(`1–20 of ${total}`);
    const next = bar?.querySelector<HTMLAnchorElement>("a.next");
    expect(next?.getAttribute("href")).toMatch(/[?&]page=2\b/);
    expect(next?.getAttribute("href")).toMatch(/[?&]after=/);
  });

  it("draws no pagination bar when the results fit one page (W8-A9)", async () => {
    renderLensPage("/search?q=northgate", graph.url);
    await findPassages();
    const total = Number(
      (await screen.findByText(/^\d+ results?$/)).textContent?.split(" ")[0],
    );
    expect(total).toBeLessThanOrEqual(20);
    expect(
      document.querySelector(".ds.search-page .ds.pagination-bar"),
    ).toBeNull();
  });

  it("holds the field and the Type facet in the open filter sheet", async () => {
    renderLensPage("/search?q=the&sheet=filter", graph.url);
    await findPassages();
    const sheet = document.querySelector('[data-region="filter-sheet"]');
    expect(sheet?.querySelector("form")).not.toBeNull();
    await waitFor(() =>
      expect(sheet?.querySelector(".ds.type-facet-bar")).not.toBeNull(),
    );
  });

  it("holds only the field in the open filter sheet when there is no text", async () => {
    renderLensPage("/search?sheet=filter", graph.url);
    await screen.findByRole("list", { name: "Lenses to browse" });
    const sheet = document.querySelector('[data-region="filter-sheet"]');
    expect(sheet?.querySelector("form")).not.toBeNull();
    expect(sheet?.querySelector(".ds.type-facet-bar")).toBeNull();
  });

  it("offers the lenses as doors when the address carries no text (W8-A9)", async () => {
    renderLensPage("/search", graph.url);
    const doors = await screen.findByRole("list", { name: "Lenses to browse" });
    expect(doors.querySelectorAll("a.door").length).toBeGreaterThan(0);
    expect(document.querySelector(".ds.search-page .results")).toBeNull();
  });

  it("gives each door its class's total and none where no class is listed (W8-A9)", async () => {
    const response = await fetch(graph.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query:
          '{ facetedInstances(classUri: "metro:Station", first: 0) { totalCount } }',
      }),
    });
    const { data } = (await response.json()) as {
      data: { facetedInstances: { totalCount: number } };
    };
    renderLensPage("/search", graph.url);
    const doors = await screen.findByRole("list", { name: "Lenses to browse" });
    await waitFor(() =>
      expect(
        doors.querySelector('a.door[href="/stations"] .total')?.textContent,
      ).toBe(String(data.facetedInstances.totalCount)),
    );
    expect(data.facetedInstances.totalCount).toBeGreaterThan(0);
    expect(doors.querySelector('a.door[href="/lines"] .total')).not.toBeNull();
    expect(doors.querySelector('a.door[href="/fleet"] .total')).not.toBeNull();
    expect(
      doors.querySelector('a.door[href="/definitions"] .total'),
    ).toBeNull();
  });

  it("offers the next steps when nothing matches (W8-A9)", async () => {
    renderLensPage("/search?q=zzzz", graph.url);
    await screen.findByText(/^Nothing matches “.+”\.$/);
    const hints = document.querySelector(".ds.search-page .none .hints");
    expect(hints?.textContent).toContain("Ctrl K");
    expect(
      screen.getByRole("link", {
        name: "Browse the Definitions, where every type is listed.",
      }),
    ).toHaveAttribute("href", "/definitions");
  });
});
