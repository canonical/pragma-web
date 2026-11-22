// Scaffolded by @canonical/summon-component:react v0.46.0

import { orderSearchFacets } from "@canonical/prism-core";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_UI_BLOCK } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import { SEARCH_PROMINENT_CLASS } from "../../constants.js";
import SearchPage, { SearchCount, SearchFacets } from "./SearchPage.js";
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
const renderPage = (
  props: SearchPageProps,
  total = 45,
  ui: ReactElement = <SearchPage {...props} />,
): void => {
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
      FacetedConnection: () => ({ totalCount: 108 }),
      SearchMatch: () => ({
        passage: "Buttons trigger actions",
        ranges: [{ start: 0, length: 3 }],
      }),
      Node: resolveRoot(MOCK_UI_BLOCK),
    }),
  );
  render(createSiteTree(environment, ui, "/search"));
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
  });

  it("says nothing matches when the provider finds nothing, and lists nothing", () => {
    renderSearch(0);
    expect(screen.getByText(/^Nothing matches “.+”\.$/)).toBeInTheDocument();
    expect(document.querySelector(".ds.search-page .results")).toBeNull();
  });

  it("counts the results for the strip, and the page repeats no count (W8-A6)", () => {
    renderPage({ text: "but" }, 45, <SearchCount text="but" />);
    expect(document.body).toHaveTextContent("45 results");
  });

  it("states no count of its own: the strip holds it", () => {
    renderPage({ text: "but" });
    expect(document.querySelector(".ds.search-page .summary")).toBeNull();
    expect(
      document.querySelector(".ds.search-page .ds.type-facet-bar"),
    ).toBeNull();
  });

  it("gives each Type facet the provider's count and a link that applies it (W8-A6)", () => {
    renderPage(
      { text: "but" },
      45,
      <SearchFacets placement="bar" text="but" />,
    );
    const facets = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        ".ds.filter-bar .ds.type-facet-bar .value a",
      ),
    ];
    const ordered = orderSearchFacets(FACETS, SEARCH_PROMINENT_CLASS);
    expect(facets).toHaveLength(ordered.length);
    facets.forEach((link, index) => {
      expect(link.querySelector(".count")?.textContent).toBe(
        String(ordered[index]?.count),
      );
      expect(link.getAttribute("href")).toContain(
        `type=${encodeURIComponent(ordered[index]?.type.uri ?? "")}`,
      );
    });
  });

  it("marks the applied Type facet current, linking it to the address that releases it", () => {
    renderPage(
      { text: "but", type: "ds:Component" },
      45,
      <SearchFacets placement="bar" text="but" type="ds:Component" />,
    );
    const links = [
      ...document.querySelectorAll<HTMLAnchorElement>(
        ".ds.type-facet-bar .value a",
      ),
    ];
    const applied = links.filter((link) =>
      link.matches('[aria-current="true"]'),
    );
    expect(applied).toHaveLength(1);
    expect(applied[0]?.getAttribute("href")).not.toContain("type=");
    const others = links.filter((link) => !applied.includes(link));
    expect(others).toHaveLength(FACETS.length - 1);
    for (const link of others) {
      expect(link.getAttribute("href")).toContain("type=");
    }
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

  it("draws no pagination bar when the results fit one page (W8-A9)", () => {
    renderPage({ text: "but" }, 5);
    expect(document.querySelector(".ds.search-page .result")).not.toBeNull();
    expect(
      document.querySelector(".ds.search-page .ds.pagination-bar"),
    ).toBeNull();
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

  it("gives each door its class's total and none where no class is listed (W8-A9)", () => {
    renderPage({ text: "" });
    const doors = screen.getByRole("list", { name: "Lenses to browse" });
    expect(
      doors.querySelector('a.door[href="/components"] .total')?.textContent,
    ).toBe("108");
    expect(
      doors.querySelector('a.door[href="/standards"] .total')?.textContent,
    ).toBe("108");
    expect(doors.querySelector('a.door[href="/guides"] .total')).toBeNull();
  });

  it("offers the next steps when nothing matches (W8-A9)", () => {
    renderPage({ text: "zzzz" }, 0);
    expect(screen.getByText(/^Nothing matches “.+”\.$/)).toBeInTheDocument();
    const hints = document.querySelector(".ds.search-page .none .hints");
    expect(hints?.textContent).toContain("Ctrl K");
    expect(
      screen.getByRole("link", {
        name: "Browse the Definitions, where every type is listed.",
      }),
    ).toHaveAttribute("href", "/definitions");
  });
});
