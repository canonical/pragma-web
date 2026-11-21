// Scaffolded by @canonical/summon-component:react v0.46.0

import { setPrefetchEnvironment } from "@canonical/prism-core";
import { screen, waitFor } from "@testing-library/react";
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
      await screen.findByText("Nothing matches the search."),
    ).toBeInTheDocument();
    expect(document.querySelector(".ds.search-page .results")).toBeNull();
  });
});
