// Scaffolded by @canonical/summon-component:react v0.46.0

import { render, screen } from "@testing-library/react";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_UI_BLOCK } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import SearchPage from "./SearchPage.js";
import type { SearchPageProps } from "./types.js";

/** Two facets of the sample's types, as the provider counts them. */
const FACETS = [
  { count: 29, type: { uri: "cs:CodeStandard", label: "Code standard" } },
  { count: 16, type: { uri: "ds:Component", label: "Component" } },
];

/**
 * Render the page with the given props over a mock graph answering
 * `total` results, twenty of them on the page, in two facets.
 */
const renderPage = (props: SearchPageProps, total = 45): void => {
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      SearchConnection: () => ({
        total,
        facets: total === 0 ? [] : FACETS,
        edges: Array.from({ length: total === 0 ? 0 : 20 }, () => ({})),
      }),
      PageInfo: () => ({ hasNextPage: total > 20, endCursor: "cursor-20" }),
      SearchMatch: () => ({
        passage: "Buttons trigger actions",
        ranges: [{ start: 0, length: 3 }],
      }),
      Node: resolveRoot(MOCK_UI_BLOCK),
    }),
  );
  render(createSiteTree(environment, <SearchPage {...props} />, "/search"));
};

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

  it("gives each Type facet the provider's count and a link that applies it (W8-A6)", () => {
    renderPage({ text: "but" });
    const facets = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        ".ds.search-page .ds.type-facet-bar .value a",
      ),
    ];
    expect(facets).toHaveLength(FACETS.length);
    facets.forEach((link, index) => {
      expect(link.querySelector(".count")?.textContent).toBe(
        String(FACETS[index]?.count),
      );
      expect(link.getAttribute("href")).toContain(
        `type=${encodeURIComponent(FACETS[index]?.type.uri ?? "")}`,
      );
    });
  });

  it("renders no result through the generic Node chip (W8-A8)", () => {
    renderPage({ text: "but" });
    const results = document.querySelectorAll(".ds.search-page .result");
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.firstElementChild?.classList.contains("node-chip")).toBe(
        false,
      );
    }
  });

  it("pages the results by 20, linking the next page with its cursor (W8-A9)", () => {
    renderPage({ text: "but" });
    expect(document.querySelectorAll(".ds.search-page .result")).toHaveLength(
      20,
    );
    const bar = document.querySelector(".ds.search-page .ds.pagination-bar");
    expect(bar?.textContent).toContain("1–20 of 45");
    const next = bar?.querySelector<HTMLAnchorElement>("a.next");
    expect(next?.getAttribute("href")).toMatch(/[?&]page=2\b/);
    expect(next?.getAttribute("href")).toMatch(/[?&]after=cursor-20\b/);
  });

  it("offers the lenses as doors when the address carries no text (W8-A9)", () => {
    renderPage({ text: "" });
    const doors = screen.getByRole("list", { name: "Lenses to browse" });
    expect(doors.querySelectorAll("a.door").length).toBeGreaterThan(0);
    expect(document.querySelector(".ds.search-page .results")).toBeNull();
  });

  it("offers the next steps when nothing matches (W8-A9)", () => {
    renderPage({ text: "zzzz" }, 0);
    expect(screen.getByText("Nothing matches the search.")).toBeInTheDocument();
    const hints = document.querySelector(".ds.search-page .none .hints");
    expect(hints?.textContent).toContain("Ctrl K");
    expect(
      screen.getByRole("link", {
        name: "Browse the Definitions, where every type is listed.",
      }),
    ).toHaveAttribute("href", "/definitions");
  });
});
