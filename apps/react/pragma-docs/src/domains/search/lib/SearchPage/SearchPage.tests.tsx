// Scaffolded by @canonical/summon-component:react v0.46.0

import { render, screen } from "@testing-library/react";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_UI_BLOCK } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import SearchPage from "./SearchPage.js";

/** Render the page for "but" over a mock graph answering `total` results. */
const renderSearch = (total: number): void => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      SearchConnection: () => ({ total, edges: total === 0 ? [] : undefined }),
      SearchMatch: () => ({
        passage: "Buttons trigger actions",
        ranges: [{ start: 0, length: 3 }],
      }),
      Node: resolveRoot(MOCK_UI_BLOCK),
    }),
  );
  render(
    createSiteTree(environment, <SearchPage text="but" />, "/search?q=but"),
  );
};

describe("SearchPage", () => {
  it("names the page in its one heading", () => {
    renderSearch(1);
    expect(
      screen.getByRole("heading", { level: 1, name: "Search" }),
    ).toBeInTheDocument();
  });

  it("lists each result through the site's chip switch over its passage", () => {
    renderSearch(1);
    const result = document.querySelector(".ds.search-page .result");
    expect(result?.firstElementChild?.className).toMatch(/\b[a-z-]+-chip\b/);
    expect(result?.querySelector(".passage")?.textContent).toBe(
      "Buttons trigger actions",
    );
    expect(screen.getByText("1 result")).toBeInTheDocument();
  });

  it("says nothing matches when the provider finds nothing, and lists nothing", () => {
    renderSearch(0);
    expect(screen.getByText("Nothing matches the search.")).toBeInTheDocument();
    expect(document.querySelector(".ds.search-page .results")).toBeNull();
  });
});
