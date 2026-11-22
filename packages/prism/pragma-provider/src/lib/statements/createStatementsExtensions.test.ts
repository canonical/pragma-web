import { appendFileSync, cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStore } from "@canonical/ke";
import {
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
} from "graphql";
import { afterAll, describe, expect, it } from "vitest";
import { CORPUS_REFS_ROOT } from "../../testing/corpus.js";
import { createPragmaProvider } from "../provider/index.js";
import { createStatementsExtensions } from "./createStatementsExtensions.js";

const DS = "https://design.example.org/ontology#";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const ELSEWHERE = "https://elsewhere.example.org/thing";

/**
 * Statements about a card: three literals of one predicate, a node and a
 * foreign IRI, and three blank values (one typed and nesting another, one
 * plain, one empty); a typed holder and a blank node naming the card.
 */
const CARD_GRAPH = `
@prefix xsd: <${XSD}> .
ds:card a ds:Component ;
  ds:tier "core" , "a"@en , "2"^^xsd:integer ;
  ds:related ds:button , <${ELSEWHERE}> ;
  ds:part [ a ds:Component ; ds:name "outer" ; ds:part [ ds:name "inner" ] ] ,
    [ ds:name "second" ] , [] .
ds:holder a ds:Component ; ds:related ds:card ;
  ds:part [ ds:name "first" , "second" ] .
[ ds:related ds:card ] .
`;

/** The selection every case reads. */
const STATEMENTS_QUERY = `query Statements($uri: ID!, $path: [String!], $per: Int, $dir: StatementDirection) {
  statements(uri: $uri, path: $path, perPredicate: $per, direction: $dir) {
    subject { uri }
    total
    groups {
      predicateUri
      predicate { uri }
      total
      values {
        __typename
        ... on StatementNode { node { uri } }
        ... on StatementLiteral { lexical datatype lang }
        ... on StatementForeign { uri curie }
        ... on StatementNested {
          type { uri }
          groups {
            predicateUri
            total
            values {
              __typename
              ... on StatementLiteral { lexical }
              ... on StatementNested { type { uri } groups { predicateUri } }
            }
          }
        }
      }
    }
  }
}`;

/** A group as `STATEMENTS_QUERY` reads it. */
interface ReadGroup {
  readonly predicateUri: string;
  readonly predicate: { readonly uri: string } | null;
  readonly total: number;
  readonly values: readonly Record<string, unknown>[];
}

/** `statements` as `STATEMENTS_QUERY` reads it. */
interface ReadStatements {
  readonly subject: { readonly uri: string } | null;
  readonly total: number;
  readonly groups: readonly ReadGroup[];
}

/** The variables a case passes. */
interface StatementsVariables {
  readonly uri: string;
  readonly path?: readonly string[];
  readonly per?: number | null;
  readonly dir?: "OUT" | "IN" | null;
}

/** A copy of the corpus with `CARD_GRAPH` appended to its instances. */
const copyCorpusWithCard = (): string => {
  const refsRoot = mkdtempSync(join(tmpdir(), "prism-statements-"));
  cpSync(CORPUS_REFS_ROOT, refsRoot, { recursive: true });
  appendFileSync(
    join(refsRoot, "design-system/main/data/instances.ttl"),
    CARD_GRAPH,
  );
  return refsRoot;
};

/** Ask `handle` for `STATEMENTS_QUERY` with `variables`. */
const askWith =
  (booted: ReturnType<typeof createPragmaProvider>) =>
  async (variables: StatementsVariables): Promise<ReadStatements | null> => {
    const { handle } = await booted;
    const response = await handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: STATEMENTS_QUERY, variables }),
      }),
    );
    const { data, errors } = (await response.json()) as {
      data: { statements: ReadStatements | null };
      errors?: unknown;
    };
    expect(errors).toBeUndefined();
    return data.statements;
  };

/** A group of `read` by its predicate's IRI. */
const findGroup = (
  read: ReadStatements | null,
  predicate: string,
): ReadGroup | undefined =>
  read?.groups.find(({ predicateUri }) => predicateUri === predicate);

describe("createStatementsExtensions", () => {
  const refsRoot = copyCorpusWithCard();
  const ask = askWith(createPragmaProvider({ refsRoot }));
  afterAll(() => rmSync(refsRoot, { recursive: true, force: true }));

  it("throws from the factory when the compiled types are missing", () => {
    expect(() =>
      createStatementsExtensions()({
        type: () => undefined,
        iface: () => undefined,
      }),
    ).toThrow("the compiled schema has no Node");
  });

  it("groups the outgoing statements: rdf:type first, then by CURIE, with totals", async () => {
    const read = await ask({ uri: `${DS}card` });
    expect(read?.subject).toEqual({ uri: `${DS}card` });
    // The provider describes the card itself too: rdfs:label, skos:definition.
    expect(
      read?.groups.map(({ predicateUri, total }) => [predicateUri, total]),
    ).toEqual([
      [RDF_TYPE, 1],
      [`${DS}part`, 3],
      [`${DS}related`, 2],
      [`${DS}tier`, 3],
      ["http://www.w3.org/2000/01/rdf-schema#label", 1],
      ["http://www.w3.org/2004/02/skos/core#definition", 1],
    ]);
    expect(read?.total).toBe(11);
    expect(findGroup(read, `${DS}tier`)?.predicate).toEqual({
      uri: `${DS}tier`,
    });
    expect(findGroup(read, `${DS}part`)?.predicate).toBeNull();
  }, 120_000);

  it("serves literals by lexical form with their datatype and language", async () => {
    const tier = findGroup(await ask({ uri: `${DS}card` }), `${DS}tier`);
    expect(tier?.values).toEqual([
      {
        __typename: "StatementLiteral",
        lexical: "2",
        datatype: `${XSD}integer`,
        lang: null,
      },
      {
        __typename: "StatementLiteral",
        lexical: "a",
        datatype: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
        lang: "en",
      },
      {
        __typename: "StatementLiteral",
        lexical: "core",
        datatype: `${XSD}string`,
        lang: null,
      },
    ]);
  }, 120_000);

  it("serves a node the graph resolves, else the IRI as foreign", async () => {
    const related = findGroup(await ask({ uri: `${DS}card` }), `${DS}related`);
    expect(related?.values).toEqual([
      { __typename: "StatementNode", node: { uri: `${DS}button` } },
      { __typename: "StatementForeign", uri: ELSEWHERE, curie: ELSEWHERE },
    ]);
  }, 120_000);

  it("expands blank values in place, one level of groups below the entity's", async () => {
    const part = findGroup(await ask({ uri: `${DS}card` }), `${DS}part`);
    expect(part?.total).toBe(3);
    const nested = part?.values.map(({ __typename, type }) => ({
      __typename,
      type,
    }));
    expect(nested).toContainEqual({
      __typename: "StatementNested",
      type: { uri: `${DS}Component` },
    });
    expect(nested?.filter(({ type }) => type === null)).toHaveLength(2);
    const outer = part?.values.find(({ type }) => type !== null);
    expect(outer?.groups).toEqual([
      expect.objectContaining({ predicateUri: RDF_TYPE }),
      expect.objectContaining({
        predicateUri: `${DS}name`,
        values: [{ __typename: "StatementLiteral", lexical: "outer" }],
      }),
      {
        predicateUri: `${DS}part`,
        total: 1,
        values: [{ __typename: "StatementNested", type: null, groups: [] }],
      },
    ]);
  }, 120_000);

  it("bounds each group to perPredicate, clamped from 1 to 50, its total true", async () => {
    const one = await ask({ uri: `${DS}card`, per: 0 });
    expect(findGroup(one, `${DS}tier`)?.total).toBe(3);
    expect(findGroup(one, `${DS}tier`)?.values).toHaveLength(1);
    const many = await ask({ uri: `${DS}card`, per: 99, dir: "OUT" });
    expect(findGroup(many, `${DS}tier`)?.values).toHaveLength(3);
    const nested = findGroup(
      await ask({ uri: `${DS}holder`, per: 1 }),
      `${DS}part`,
    )
      ?.values.at(0)
      ?.groups?.find(({ predicateUri }) => predicateUri === `${DS}name`);
    expect(nested?.total).toBe(2);
    expect(nested?.values).toHaveLength(1);
    const unset = await ask({ uri: `${DS}card`, per: null, dir: null });
    expect(findGroup(unset, `${DS}tier`)?.values).toHaveLength(3);
  }, 120_000);

  it("reads inwards: the subjects naming the entity, blank ones expanded", async () => {
    const read = await ask({ uri: `${DS}card`, dir: "IN" });
    expect(read?.total).toBe(2);
    expect(findGroup(read, `${DS}related`)?.values).toEqual([
      { __typename: "StatementNode", node: { uri: `${DS}holder` } },
      {
        __typename: "StatementNested",
        type: null,
        groups: [
          {
            predicateUri: `${DS}related`,
            total: 1,
            values: [{ __typename: "StatementNode" }],
          },
        ],
      },
    ]);
  }, 120_000);

  it("serves a node with no statements that way as empty, and null for no node", async () => {
    expect(await ask({ uri: `${DS}holder`, dir: "IN" })).toEqual({
      subject: { uri: `${DS}holder` },
      total: 0,
      groups: [],
    });
    expect(await ask({ uri: `${DS}nothing`, dir: "IN" })).toBeNull();
    expect(await ask({ uri: "not an iri" })).toBeNull();
  }, 120_000);

  it("follows a path to a blank value by local name and index", async () => {
    // Blank values order by their statements: the empty one, the typed
    // one (rdf:type's IRI sorts first), then "second".
    const outer = await ask({ uri: `${DS}card`, path: ["part", "1"] });
    expect(outer?.subject).toBeNull();
    expect(outer?.total).toBe(3);
    expect(findGroup(outer, `${DS}part`)?.values).toEqual([
      expect.objectContaining({
        __typename: "StatementNested",
        groups: [expect.objectContaining({ predicateUri: `${DS}name` })],
      }),
    ]);
    const inner = await ask({
      uri: `${DS}card`,
      path: ["part", "1", "part", "0"],
    });
    expect(findGroup(inner, `${DS}name`)?.values).toEqual([
      {
        __typename: "StatementLiteral",
        lexical: "inner",
        datatype: `${XSD}string`,
        lang: null,
      },
    ]);
    expect(await ask({ uri: `${DS}card`, path: ["part", "0"] })).toEqual({
      subject: null,
      total: 0,
      groups: [],
    });
  }, 120_000);

  it("lists blank values in the order a path index counts them", async () => {
    const listed = findGroup(await ask({ uri: `${DS}card` }), `${DS}part`);
    const paths = await Promise.all(
      [0, 1, 2].map((index) =>
        ask({ uri: `${DS}card`, path: ["part", String(index)] }),
      ),
    );
    expect(
      paths.map((read) => read?.groups.map(({ predicateUri }) => predicateUri)),
    ).toEqual(
      listed?.values.map(({ groups }) =>
        (groups as readonly { predicateUri: string }[]).map(
          ({ predicateUri }) => predicateUri,
        ),
      ),
    );
    const first = findGroup(
      await ask({ uri: `${DS}card`, per: 1 }),
      `${DS}part`,
    );
    expect(first?.total).toBe(3);
    expect(first?.values).toEqual([
      { __typename: "StatementNested", type: null, groups: [] },
    ]);
  }, 120_000);

  it("refuses a path that selects nothing, or one read inwards", async () => {
    for (const path of [
      ["part", "9"],
      ["part"],
      ["part", "x"],
      ["tier", "0"],
    ]) {
      expect(await ask({ uri: `${DS}card`, path })).toBeNull();
    }
    expect(await ask({ uri: `${DS}nothing`, path: ["part", "0"] })).toBeNull();
    expect(
      await ask({ uri: `${DS}card`, path: ["part", "1"], dir: "IN" }),
    ).toBeNull();
  }, 120_000);

  it("names the root field it cannot resolve a value through", async () => {
    const withUri = (name: string, fields = {}) =>
      new GraphQLObjectType({
        name,
        fields: { uri: { type: new GraphQLNonNull(GraphQLID) }, ...fields },
      });
    const property = withUri("OntologyProperty");
    const classProperty = new GraphQLObjectType({
      name: "ClassProperty",
      fields: { property: { type: new GraphQLNonNull(property) } },
    });
    const ontologyClass = withUri("OntologyClass", {
      properties: { type: new GraphQLList(new GraphQLNonNull(classProperty)) },
    });
    const meta = new GraphQLObjectType({
      name: "EntityMeta",
      fields: { type: { type: new GraphQLNonNull(ontologyClass) } },
    });
    const node = new GraphQLInterfaceType({
      name: "Node",
      fields: {
        uri: { type: new GraphQLNonNull(GraphQLID) },
        _meta: { type: new GraphQLNonNull(meta) },
      },
    });
    const { Query } = createStatementsExtensions()({
      type: () => undefined,
      iface: (name) => (name === "Node" ? node : undefined),
    });
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({ name: "Query", fields: { ...Query } }),
    });
    const store = await createStore({
      sources: [{ content: `<urn:a> <urn:p> <urn:b> .`, path: "probe.ttl" }],
    });
    const result = await graphql({
      schema,
      source:
        '{ statements(uri: "urn:a") { groups { values { __typename } } } }',
      contextValue: { store, namespaces: new Map() },
    });
    expect(result.errors?.at(0)?.message).toBe(
      "the schema has no Query.node to resolve values through",
    );
  });
});

describe("createStatementsExtensions over the installed design system", () => {
  const ask = askWith(createPragmaProvider());
  const BUTTON = "https://ds.canonical.com/global.component.button";

  it("serves Button's 14 groups and 43 statements, 24 token bindings bounded to 12", async () => {
    const read = await ask({ uri: BUTTON });
    expect(read?.groups).toHaveLength(14);
    expect(read?.total).toBe(43);
    const bindings = findGroup(
      read,
      "https://ds.canonical.com/hasTokenBinding",
    );
    expect(bindings?.total).toBe(24);
    expect(bindings?.values).toHaveLength(12);
    for (const { total, values } of read?.groups ?? []) {
      expect(values.length).toBe(Math.min(total, 12));
    }
  }, 180_000);

  it("serves what names Button: 145 statements, 144 of them token bindings", async () => {
    const read = await ask({ uri: BUTTON, dir: "IN", per: 99 });
    expect(read?.total).toBe(145);
    const via = findGroup(read, "https://ds.canonical.com/viaBlock");
    expect(via?.total).toBe(144);
    expect(via?.values).toHaveLength(50);
    expect(read?.groups.reduce((sum, { total }) => sum + total, 0)).toBe(
      read?.total,
    );
  }, 180_000);
});
