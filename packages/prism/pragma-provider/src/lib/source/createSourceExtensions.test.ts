import type { Term } from "@canonical/ke";
import {
  type ExecutionResult,
  experimentalExecuteIncrementally,
  parse,
} from "graphql";
import oxigraph from "oxigraph";
import { describe, expect, it } from "vitest";
import { bootCorpusQuery } from "../../testing/bootCorpusQuery.js";
import { CORPUS_REFS_ROOT } from "../../testing/corpus.js";
import { createPragmaProvider } from "../provider/index.js";
import { createSourceExtensions } from "./createSourceExtensions.js";

const SOURCE_QUERY = "query Source($uri: ID!) { source(uri: $uri) }";
const BUTTON = "https://design.example.org/ontology#button";

/** A ke term as an Oxigraph term. */
const toOxigraphTerm = (term: Term) => {
  if (term.termType === "NamedNode") return oxigraph.namedNode(term.value);
  if (term.termType === "BlankNode") return oxigraph.blankNode(term.value);
  return oxigraph.literal(
    term.value,
    term.language !== undefined && term.language !== ""
      ? term.language
      : term.datatype === undefined
        ? undefined
        : oxigraph.namedNode(term.datatype),
  );
};

describe("createSourceExtensions", () => {
  const booted = createPragmaProvider({ refsRoot: CORPUS_REFS_ROOT });

  /** Ask the provider's handler for `uri`'s source. */
  const ask = async (uri: string): Promise<unknown> => {
    const { handle } = await booted;
    const response = await handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: SOURCE_QUERY, variables: { uri } }),
      }),
    );
    return response.json();
  };

  /** Run `SOURCE_QUERY` against the schema with a hand-built context. */
  const run = async (
    uri: string,
    contextValue: unknown,
  ): Promise<ExecutionResult> => {
    const result = await experimentalExecuteIncrementally({
      schema: (await booted).api.schema,
      document: parse(SOURCE_QUERY),
      variableValues: { uri },
      contextValue,
    });
    if ("initialResult" in result) {
      throw new Error("expected a single result, got an incremental one");
    }
    return result;
  };

  it("declares the root field with the extension's signature", () => {
    const { Query } = createSourceExtensions()({
      type: () => undefined,
      iface: () => undefined,
    });
    expect(String(Query?.source?.type)).toBe("String");
  });

  it("serves an entity's statements, which parse back to the graph's", async () => {
    const body = (await ask(BUTTON)) as { data: { source: string } };
    const text = body.data.source;
    expect(text.startsWith("@prefix ")).toBe(true);
    const construct = await (await bootCorpusQuery())(
      `CONSTRUCT { <${BUTTON}> ?p ?o } WHERE { <${BUTTON}> ?p ?o }`,
    );
    if (construct.type !== "construct") throw new Error("no statements");
    const expected = construct.quads
      .map(({ subject, predicate, object }) =>
        oxigraph
          .quad(
            toOxigraphTerm(subject) as ReturnType<typeof oxigraph.namedNode>,
            oxigraph.namedNode(predicate.value),
            toOxigraphTerm(object),
          )
          .toString(),
      )
      .sort();
    const served = oxigraph
      .parse(text, { format: "text/turtle" })
      .map((quad) => quad.toString())
      .sort();
    expect(served).toEqual(expected);
    expect(served.length).toBeGreaterThan(0);
  });

  it("serves null for an IRI the graph holds nothing about", async () => {
    expect(await ask("https://design.example.org/ontology#nothing")).toEqual({
      data: { source: null },
    });
  });

  it("refuses an argument that is not a safe absolute IRI, without a query", async () => {
    const untouchable = {
      namespaces: new Map(),
      get store(): never {
        throw new Error("the store was queried");
      },
    };
    expect(await run("button", untouchable)).toEqual({
      data: { source: null },
    });
    expect(await run("https://a.example/a> ?p ?o } #", untouchable)).toEqual({
      data: { source: null },
    });
  });
});
