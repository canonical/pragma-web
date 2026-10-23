// =============================================================================
// Text search served over the provider's own handler: an index built at boot
// from the compiled schema, ranked per request, paged as every ke-graphql
// connection is paged, with each node resolved as node(id:) resolves it.
// =============================================================================

import { toBase64 } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import { createPragmaProvider } from "../../lib/provider/index.js";
import { CORPUS_REFS_ROOT, CORPUS_SEM_ROOT } from "../corpus.js";

const DS = "https://design.example.org/ontology#";

/** The selection every case reads. */
const SEARCH_QUERY = `query Search($text: String!, $first: Int, $after: String) {
  search(text: $text, first: $first, after: $after) {
    edges { cursor node { __typename uri } }
    pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
  }
}`;

/** The page `search` answers with, as this file selects it. */
interface SearchPage {
  readonly edges: readonly {
    readonly cursor: string;
    readonly node: { readonly __typename: string; readonly uri: string };
  }[];
  readonly pageInfo: {
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
    readonly startCursor: string | null;
    readonly endCursor: string | null;
  };
}

/** The response body, as this file reads it. */
interface SearchBody {
  readonly data?: { readonly search: SearchPage } | null;
  readonly errors?: readonly { readonly message: string }[];
}

describe("Query.search", () => {
  const booted = createPragmaProvider({
    refsRoot: CORPUS_REFS_ROOT,
    semRoot: CORPUS_SEM_ROOT,
  });

  /** POST `SEARCH_QUERY` with `variables`, and return the body. */
  const post = async (
    variables: Record<string, unknown>,
  ): Promise<SearchBody> => {
    const { handle } = await booted;
    const response = await handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: SEARCH_QUERY, variables }),
      }),
    );
    return (await response.json()) as SearchBody;
  };

  /** The page for `variables`, which must not error. */
  const search = async (
    variables: Record<string, unknown>,
  ): Promise<SearchPage> => {
    const body = await post(variables);
    expect(body.errors).toBeUndefined();
    const page = body.data?.search;
    if (page === undefined) throw new Error("search answered no page");
    return page;
  };

  /** The IRIs of the page for `text`, in rank order. */
  const rank = async (text: string): Promise<readonly string[]> =>
    (await search({ text })).edges.map((edge) => edge.node.uri);

  it("is declared in the compiled schema", async () => {
    const { api } = await booted;
    expect(api.sdl).toContain(
      "search(text: String!, first: Int, after: String): NodeConnection!",
    );
  });

  it("ranks title matches by length and position, then definition matches", async () => {
    const page = await search({ text: "card" });
    expect(page.edges.map((edge) => edge.node)).toEqual([
      { __typename: "Component", uri: `${DS}card` },
      { __typename: "Component", uri: `${DS}card-grid` },
      { __typename: "Component", uri: `${DS}scorecard` },
      { __typename: "Component", uri: `${DS}tile` },
    ]);
  });

  it("ignores the case of the text", async () => {
    expect(await rank("CARD")).toEqual(await rank("card"));
  });

  it("matches a CURIE", async () => {
    expect(await rank("ds:card")).toEqual([`${DS}card`, `${DS}card-grid`]);
  });

  it("matches a definition", async () => {
    expect(await rank("surface")).toEqual([`${DS}card`]);
  });

  it("finds a class from the second root", async () => {
    const page = await search({ text: "job" });
    expect(page.edges.map((edge) => edge.node)).toContainEqual({
      __typename: "OntologyClass",
      uri: "sem://surface#Job",
    });
  });

  it.each(["", "  "])("answers %j with the empty page", async (text) => {
    expect(await search({ text })).toEqual({
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    });
  });

  it("pages the ranking with first and after", async () => {
    const head = await search({ text: "card", first: 2 });
    expect(head.edges.map((edge) => edge.node.uri)).toEqual([
      `${DS}card`,
      `${DS}card-grid`,
    ]);
    expect(head.pageInfo).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: toBase64(`${DS}card`),
      endCursor: toBase64(`${DS}card-grid`),
    });
    const tail = await search({
      text: "card",
      first: 2,
      after: head.pageInfo.endCursor,
    });
    expect(tail.edges.map((edge) => edge.node.uri)).toEqual([
      `${DS}scorecard`,
      `${DS}tile`,
    ]);
    expect(tail.pageInfo).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("starts from the head after a cursor it does not know", async () => {
    const page = await search({
      text: "card",
      first: 1,
      after: toBase64(`${DS}nothing`),
    });
    expect(page.edges.map((edge) => edge.node.uri)).toEqual([`${DS}card`]);
  });

  it("refuses a negative first", async () => {
    const body = await post({ text: "card", first: -1 });
    expect(body.errors?.map((error) => error.message)).toEqual([
      'Argument "first" must be a non-negative integer',
    ]);
  });
});
