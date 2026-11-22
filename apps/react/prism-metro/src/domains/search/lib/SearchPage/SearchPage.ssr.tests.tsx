// Scaffolded by @canonical/summon-component:react v0.46.0

import { renderToString } from "react-dom/server";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import { MESSAGES } from "#i18n";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import SearchPage from "./SearchPage.js";

/**
 * Render a page past the first of a search for "e" against a mock
 * environment whose page info the test names, with two facets whose
 * classes have no label.
 */
const renderLaterPage = (
  page: number,
  pageInfo: { hasNextPage: boolean; endCursor: string | null },
): string => {
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      SearchConnection: () => ({
        total: 45,
        facets: [{ count: 30 }, { count: 15 }],
      }),
      PageInfo: () => pageInfo,
      OntologyClass: (_context, generateId) => ({
        uri: `https://example.org/Class${generateId()}`,
        label: null,
        _meta: { title: "Untitled class" },
      }),
      Node: resolveRoot(MOCK_STATION),
    }),
  );
  return renderToString(
    createProjectionTree(
      environment,
      <SearchPage after="cursor-40" page={page} text="e" />,
    ),
  );
};

describe("SearchPage SSR", () => {
  it("server-renders its heading, its count and each result with its passage", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        SearchConnection: () => ({ total: 1 }),
        SearchMatch: () => ({
          passage: "Northgate interchange",
          ranges: [{ start: 0, length: 9 }],
        }),
        Node: resolveRoot(MOCK_STATION),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <SearchPage text="northgate" />),
    );
    expect(html).toContain('class="ds search-page"');
    expect(html).toContain(`>${MESSAGES["search.title"]}</h1>`);
    expect(html).toContain("1 result");
    expect(html).toContain('class="ds search-passage passage"');
    expect(html).toContain('<mark class="match">Northgate</mark>');
  });

  it("links the previous page after the cursor that ends the page before it", () => {
    const html = renderLaterPage(3, {
      hasNextPage: true,
      endCursor: "cursor-60",
    });
    expect(html).toMatch(/href="\/search\?[^"]*after=cursor-60[^"]*page=2/);
    expect(html).toMatch(/href="\/search\?[^"]*after=cursor-60[^"]*page=4/);
  });

  it("names a facet by its class's title when the class has no label", () => {
    const html = renderLaterPage(3, {
      hasNextPage: true,
      endCursor: "cursor-60",
    });
    expect(html).toContain("Untitled class");
  });

  it("links no next page, and the previous page from the start, without an end cursor", () => {
    const html = renderLaterPage(3, { hasNextPage: true, endCursor: null });
    expect(html).not.toMatch(/page=4/);
    expect(html).toMatch(/href="\/search\?[^"]*page=2/);
    expect(html).not.toMatch(/after=/);
  });

  it("links the previous page of the second as the first, with no cursor", () => {
    const html = renderLaterPage(2, { hasNextPage: false, endCursor: null });
    expect(html).toContain('href="/search?q=e"');
    expect(html).not.toMatch(/after=|page=/);
  });
});
