import {
  type ExecutionResult,
  experimentalExecuteIncrementally,
  parse,
} from "graphql";
import { createStore } from "@canonical/ke";
import { createStoreQueryFn } from "@canonical/ke-graphql";
import oxigraph from "oxigraph";
import { describe, expect, it } from "vitest";
import { bootCorpusQuery } from "../../testing/bootCorpusQuery.js";
import { CORPUS_REFS_ROOT } from "../../testing/corpus.js";
import { createPragmaProvider } from "../provider/index.js";
import { RDF_TYPE, XSD_STRING } from "./constants.js";
import { createSourceExtensions } from "./createSourceExtensions.js";

const DS = "https://design.example.org/ontology#";

/**
 * A graph whose entities are described through blank nodes: a card with a
 * nested property and two examples, a node it shares with another entity,
 * and a ring of two blank nodes that closes on itself.
 */
const BLANK_NODE_GRAPH = `@prefix ds: <${DS}> .
ds:card a ds:Component ;
  ds:property [ a ds:Property ; ds:name "tone" ; ds:binding [ ds:token "color.text" ] ] ;
  ds:example [ ds:kind "do" ; ds:text "Use one" ], [ ds:kind "dont" ; ds:text "Use two" ] ;
  ds:related ds:other .
ds:other a ds:Component ; ds:part [ ds:name "elsewhere" ] .
ds:ring a ds:Component ; ds:start _:first .
_:first ds:next _:second .
_:second ds:next _:first .
`;

const SOURCE_QUERY = "query Source($uri: ID!) { source(uri: $uri) }";
const BUTTON = "https://design.example.org/ontology#button";

/** A term either side reads: ke's, or Oxigraph's parse of the text. */
interface AnyTerm {
  readonly termType: string;
  readonly value: string;
  readonly language?: string;
  readonly datatype?: string | { readonly value: string };
}

/** A statement either side reads. */
interface AnyQuad {
  readonly subject: AnyTerm;
  readonly predicate: AnyTerm;
  readonly object: AnyTerm;
}

/** A term that is not a blank node, as text. */
const writeTermText = ({ termType, value, language, datatype }: AnyTerm) => {
  if (termType === "NamedNode") return `<${value}>`;
  const type = typeof datatype === "string" ? datatype : datatype?.value;
  return `${JSON.stringify(value)}@${language ?? ""}^^${
    language !== undefined && language !== "" ? "" : (type ?? XSD_STRING)
  }`;
};

/**
 * The statements of `subject` with every blank object written as its own
 * statements, in place and in order: two graphs that describe `subject`
 * the same read the same, whatever their blank nodes' labels.
 */
const describeTree = (
  subject: AnyTerm,
  quads: readonly AnyQuad[],
  seen: ReadonlySet<string> = new Set(),
): string[] =>
  quads
    .filter(
      (quad) =>
        quad.subject.termType === subject.termType &&
        quad.subject.value === subject.value,
    )
    .map(({ predicate, object }) =>
      object.termType === "BlankNode" && !seen.has(object.value)
        ? `<${predicate.value}> [${describeTree(object, quads, new Set([...seen, object.value])).join(" ; ")}]`
        : `<${predicate.value}> ${writeTermText(object)}`,
    )
    .sort();

/** The blank nodes `quads` name as an object but never describe. */
const findUndescribed = (quads: readonly AnyQuad[]): string[] =>
  quads
    .filter(
      ({ object }) =>
        object.termType === "BlankNode" &&
        !quads.some(({ subject }) => subject.value === object.value),
    )
    .map(({ object }) => object.value);

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

  it("serves every typed IRI's statements and its blank nodes', which parse back to the graph's", async () => {
    const query = await bootCorpusQuery();
    const graph = await query("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }");
    if (graph.type !== "construct") throw new Error("no statements");
    const typed = [
      ...new Set(
        graph.quads
          .filter(
            ({ subject, predicate }) =>
              subject.termType === "NamedNode" &&
              predicate.value === RDF_TYPE,
          )
          .map(({ subject }) => subject.value),
      ),
    ];
    expect(typed).toContain(BUTTON);
    for (const uri of typed) {
      const body = (await ask(uri)) as { data: { source: string } };
      const text = body.data.source;
      expect(text.startsWith("@prefix ")).toBe(true);
      const served = oxigraph.parse(text, { format: "text/turtle" });
      const root = { termType: "NamedNode", value: uri };
      expect(findUndescribed(served)).toEqual([]);
      expect(describeTree(root, served)).toEqual(
        describeTree(root, graph.quads),
      );
    }
  }, 120_000);

  it("describes blank-node objects in place, to any depth, and closes a cycle", async () => {
    const store = await createStore({
      sources: [{ content: BLANK_NODE_GRAPH, path: "blank.ttl" }],
    });
    const context = {
      namespaces: new Map([["ds", { prefix: "ds", uri: DS }]]),
      store,
    };
    const graph = await createStoreQueryFn(store)(
      "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }",
    );
    if (graph.type !== "construct") throw new Error("no statements");
    for (const name of ["card", "ring"]) {
      const uri = `${DS}${name}`;
      const { data } = (await run(uri, context)) as {
        data: { source: string };
      };
      const served = oxigraph.parse(data.source, { format: "text/turtle" });
      const root = { termType: "NamedNode", value: uri };
      expect(findUndescribed(served)).toEqual([]);
      expect(describeTree(root, served)).toEqual(
        describeTree(root, graph.quads),
      );
    }
    const { data } = (await run(`${DS}card`, context)) as {
      data: { source: string };
    };
    // Each example is written where the card names it; nothing else of the
    // graph is.
    expect(data.source).toContain(`ds:binding [
      ds:token "color.text"
    ]`);
    expect(data.source).not.toMatch(/_:/);
    expect(data.source).not.toContain("elsewhere");
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
