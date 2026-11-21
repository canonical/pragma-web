// @vitest-environment node

/**
 * The site's provider answers the search page's query over the installed
 * corpus: the results and type facets for "but" (W8-A5), held against the
 * sample the results page was designed on, as the provider's own totals.
 */

import { createPragmaProvider } from "@canonical/prism-pragma-provider";
import { beforeAll, describe, expect, it, vi } from "vitest";

const BOOT_TIMEOUT_MS = 60_000;

/** What the search page reads of one search, by type IRI. */
interface SearchAnswer {
  readonly total: number;
  readonly edges: readonly {
    readonly node: { readonly uri: string; readonly _meta: { readonly curie: string; readonly type: { readonly uri: string } } };
    readonly match: { readonly passage: string };
  }[];
  readonly facets: readonly {
    readonly type: { readonly uri: string };
    readonly count: number;
  }[];
}

const SEARCH = `query($text: String!, $types: [ID!]) {
  search(text: $text, first: 100, types: $types) {
    total
    edges { node { uri _meta { curie type { uri } } } match { passage } }
    facets { type { uri } count }
  }
}`;

let search: (
  text: string,
  types?: readonly string[],
) => Promise<SearchAnswer>;

beforeAll(async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { handle } = await createPragmaProvider();
  warn.mockRestore();
  search = async (text, types) => {
    const response = await handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: SEARCH, variables: { text, types } }),
      }),
    );
    const { data, errors } = (await response.json()) as {
      readonly data?: { readonly search: SearchAnswer };
      readonly errors?: unknown;
    };
    if (errors !== undefined || data === undefined) {
      throw new Error(`the graph answered ${JSON.stringify(errors)}`);
    }
    return data.search;
  };
}, BOOT_TIMEOUT_MS);

/**
 * The sample's hits for "but" that the installed corpus holds, by the
 * sample's type: each IRI is the class the provider counts that type under.
 * The sample's other hits matched a description the corpus words otherwise.
 */
const SAMPLE_HITS = [
  ["ds:global.component.button", "https://ds.canonical.com/Component"],
  [
    "cs:css.selectors.namespace",
    "http://pragma.canonical.com/codestandards#CodeStandard",
  ],
  ["ds:Subcomponent", "http://www.w3.org/2002/07/owl#Class"],
] as const;

describe("search over the site's provider", () => {
  it("finds the sample's hits for but under the sample's three types (W8-A5)", async () => {
    const answer = await search("but");
    const found = answer.edges.map(
      ({ node }) => [node._meta.curie, node._meta.type.uri] as const,
    );
    expect(found).toEqual(expect.arrayContaining([...SAMPLE_HITS]));
    expect(answer.facets.map(({ type }) => type.uri)).toEqual(
      expect.arrayContaining(SAMPLE_HITS.map(([, type]) => type)),
    );
  });

  it("totals every result for but once, by type, most first (W8-A5)", async () => {
    const answer = await search("but");
    const counts = answer.facets.map(({ count }) => count);
    expect(answer.edges).toHaveLength(answer.total);
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(answer.total);
    expect(counts).toEqual(counts.toSorted((a, b) => b - a));
  });

  it("answers each type facet's count as the total its filter shows (W8-A5)", async () => {
    const { facets } = await search("but");
    for (const { type, count } of facets) {
      const narrowed = await search("but", [type.uri]);
      expect(narrowed.total).toBe(count);
      expect(
        narrowed.edges.every(({ node }) => node._meta.type.uri === type.uri),
      ).toBe(true);
    }
  });
});
