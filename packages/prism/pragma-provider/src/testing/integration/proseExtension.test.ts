// =============================================================================
// Prose served over the provider's own handler: Markdown sidecars beside the
// corpus's Turtle, bound at boot, answered per request in the request's
// language, with their links resolved through the graph.
// =============================================================================

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createPragmaProvider } from "../../lib/provider/index.js";
import { CORPUS_REFS_ROOT, CORPUS_SEM_ROOT } from "../corpus.js";

const DS = "https://design.example.org/ontology#";

/** The selection every case reads. */
const PROSE_QUERY = `query Prose($uri: ID!, $lang: String) {
  prose(uri: $uri) {
    lang
    availableLanguages
    markdown
    asked: markdown(lang: $lang)
    references { edges { node { __typename uri } } }
  }
}`;

/** A corpus sidecar's Markdown, read from disk. */
const readCorpusFile = (path: string): string =>
  readFileSync(join(CORPUS_REFS_ROOT, "design-system/main", path), "utf-8");

describe("Query.prose", () => {
  const booted = createPragmaProvider({
    refsRoot: CORPUS_REFS_ROOT,
    semRoot: CORPUS_SEM_ROOT,
  });

  /** POST `PROSE_QUERY` with `variables`, and `locale` as the header. */
  const ask = async (
    variables: Record<string, unknown>,
    locale?: string,
  ): Promise<unknown> => {
    const { handle } = await booted;
    const response = await handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(locale === undefined ? {} : { "x-prism-locale": locale }),
        },
        body: JSON.stringify({ query: PROSE_QUERY, variables }),
      }),
    );
    const body = (await response.json()) as {
      data?: { prose: unknown };
      errors?: unknown;
    };
    expect(body.errors).toBeUndefined();
    return body.data?.prose;
  };

  it("is declared in the compiled schema", async () => {
    const { api } = await booted;
    expect(api.sdl).toContain("type Prose {");
    expect(api.sdl).toContain("prose(uri: ID!): Prose");
    expect(api.sdl).toContain("references: NodeConnection!");
  });

  it("serves the default language without a header", async () => {
    expect(await ask({ uri: `${DS}button` })).toEqual({
      lang: "en",
      availableLanguages: ["en", "fr"],
      markdown: readCorpusFile("data/button.md"),
      asked: readCorpusFile("data/button.md"),
      references: {
        edges: [
          { node: { __typename: "Component", uri: `${DS}button` } },
          { node: { __typename: "OntologyClass", uri: `${DS}Component` } },
        ],
      },
    });
  });

  it("resolves only links that name entities", async () => {
    const prose = (await ask({ uri: `${DS}button` })) as {
      references: { edges: { node: { uri: string } }[] };
    };
    const uris = prose.references.edges.map((edge) => edge.node.uri);
    // In a code span, so not a link.
    expect(uris).not.toContain(`${DS}Entity`);
    // A link, but to nothing in the graph.
    expect(uris).not.toContain("https://example.com/spec");
  });

  it("serves the language the header names", async () => {
    expect(await ask({ uri: `${DS}button` }, "fr")).toMatchObject({
      lang: "fr",
      markdown: readCorpusFile("data/button.fr.md"),
    });
  });

  it("serves the language markdown(lang:) asks for, without a header", async () => {
    expect(await ask({ uri: `${DS}button`, lang: "fr" })).toMatchObject({
      lang: "en",
      markdown: readCorpusFile("data/button.md"),
      asked: readCorpusFile("data/button.fr.md"),
    });
  });

  it("falls back to the locale when lang is not authored", async () => {
    expect(await ask({ uri: `${DS}button`, lang: "de" }, "fr")).toMatchObject({
      asked: readCorpusFile("data/button.fr.md"),
    });
  });

  it("falls back to the default language for an unauthored locale", async () => {
    expect(await ask({ uri: `${DS}button` }, "de")).toMatchObject({
      lang: "en",
      markdown: readCorpusFile("data/button.md"),
    });
  });

  it("treats a malformed header as no header", async () => {
    expect(await ask({ uri: `${DS}button` }, "FR")).toMatchObject({
      lang: "en",
    });
  });

  it("is null for an entity without prose", async () => {
    expect(await ask({ uri: `${DS}Component` })).toBeNull();
  });

  it("is null for a value that is not an IRI", async () => {
    expect(await ask({ uri: "button" })).toBeNull();
  });
});
