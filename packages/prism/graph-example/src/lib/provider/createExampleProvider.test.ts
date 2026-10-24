import { type ExecutionResult, graphql } from "graphql";
import { beforeAll, describe, expect, it } from "vitest";
import { assertPresent } from "../../testing/assertPresent.js";
import {
  expectFieldsRoundTrip,
  readNodeMeta,
  selectOnNode,
} from "../../testing/expectFieldsRoundTrip.js";
import {
  ASYMMETRIC_UNIT_URI,
  COUPLED_FORMATION_URI,
  COUPLED_STOCK_URI,
  EMPTY_LOCAL_NAME_DATASET,
  EMPTY_LOCAL_NAME_URI,
  MIXED_STOCK_LINE_URI,
  OVERLONG_LINE_URI,
  REVERSED_UNIT_FORMATION_URI,
  SHORT_PLATFORM_STATION_URI,
  SINGLE_UNIT_FORMATION_URI,
} from "../../testing/fixtures.js";
import type { PublishedFields } from "../../testing/types.js";
import { toCursor } from "./connection.js";
import {
  CALL_CLASS_URI,
  CAR_POSITION_CLASS_URI,
  DIAGRAM_POINT_CLASS_URI,
  GEO_POINT_CLASS_URI,
  META_CLASS_URI,
  ROUTE_CLASS_URI,
  UNIT_POSITION_CLASS_URI,
} from "./constants.js";
import { createExampleProvider } from "./createExampleProvider.js";
import {
  BARE_ENTITY_URI,
  exampleDataset,
  MULTILINGUAL_ENTITY_URI,
  SECOND_NAMESPACE_ENTITY_URI,
} from "./dataset.js";
import { isNetworkEntity } from "./isNetworkEntity.js";
import type { ExampleDataset } from "./types.js";

const provider = createExampleProvider();

/** Execute against the default dataset and fail loudly on any GraphQL error. */
const run = async (
  source: string,
  variableValues?: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  const result: ExecutionResult = await graphql({
    schema: provider.schema,
    source,
    rootValue: provider.rootValue,
    variableValues,
  });
  expect(result.errors).toBeUndefined();
  expect(result.data).not.toBeNull();
  return result.data as Record<string, unknown>;
};

/** Execute against a purpose-built dataset — used for the defensive paths. */
const runWith = async (
  dataset: ExampleDataset,
  source: string,
): Promise<Record<string, unknown>> => {
  const custom = createExampleProvider(dataset);
  const result = await graphql({
    schema: custom.schema,
    source,
    rootValue: custom.rootValue,
  });
  expect(result.errors).toBeUndefined();
  return result.data as Record<string, unknown>;
};

describe("the schema", () => {
  it("is built from the authored contract plus this package's extension", () => {
    expect(provider.sdl).toContain("interface Node");
    expect(provider.sdl).toContain("type Station implements Node");
  });

  it("adds two root fields, prose and search, to the contract's five", () => {
    const query = provider.schema.getQueryType();
    expect(Object.keys(query?.getFields() ?? {}).sort()).toEqual([
      "node",
      "ontologies",
      "ontology",
      "ontologyClass",
      "ontologyProperty",
      "prose",
      "search",
    ]);
  });

  it("declares the provider's own types as Node implementers", () => {
    const node = provider.schema.getType("Node");
    const names = provider.schema
      .getPossibleTypes(
        // biome-ignore lint/suspicious/noExplicitAny: narrowing an abstract type for a schema assertion
        node as any,
      )
      .map((type) => type.name)
      .sort();
    // The network's four types and the fleet's four (rolling stocks, their
    // formations, units and car types), which are Nodes so a client can
    // address each one by its IRI.
    expect(names).toEqual([
      "CarType",
      "Formation",
      "Interchange",
      "Line",
      "OntologyClass",
      "RollingStock",
      "Station",
      "Unit",
      "Zone",
    ]);
  });
});

describe("Query.node", () => {
  it("resolves an entity by absolute IRI", async () => {
    const data = await run(
      `{ node(id: "${MULTILINGUAL_ENTITY_URI}") { __typename uri } }`,
    );
    expect(data.node).toEqual({
      __typename: "Station",
      uri: MULTILINGUAL_ENTITY_URI,
    });
  });

  it("resolves an ontology class, which is also a Node", async () => {
    const data = await run(
      `{ node(id: "https://metro.example/onto#Station") { __typename uri } }`,
    );
    expect(data.node).toEqual({
      __typename: "OntologyClass",
      uri: "https://metro.example/onto#Station",
    });
  });

  it("is null for an unknown IRI", async () => {
    const data = await run(
      `{ node(id: "https://metro.example/onto#nope") { uri } }`,
    );
    expect(data.node).toBeNull();
  });

  it("gives every entity a __typename the schema declares", async () => {
    const data = await run(
      `{ ontologyClass(uri: "metro:Stop") { instances(first: 99) { edges { node { __typename } } } } }`,
    );
    const cls = data.ontologyClass as {
      instances: { edges: { node: { __typename: string } }[] };
    };
    for (const edge of cls.instances.edges) {
      expect(["Station", "Interchange", "Line"]).toContain(
        edge.node.__typename,
      );
    }
  });
});

describe("Query.prose", () => {
  /** The prose selection every case reads. */
  const PROSE = `query Prose($uri: ID!, $lang: String) {
    prose(uri: $uri) {
      lang
      availableLanguages
      markdown
      asked: markdown(lang: $lang)
      references {
        edges { cursor node { __typename uri } }
        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
      }
    }
  }`;

  /** Run `PROSE` with `variables`, and with `contextValue` when given. */
  const ask = async (
    variables: Record<string, unknown>,
    contextValue?: unknown,
  ): Promise<Record<string, unknown> | null> => {
    const result = await graphql({
      schema: provider.schema,
      source: PROSE,
      rootValue: provider.rootValue,
      variableValues: variables,
      contextValue,
    });
    expect(result.errors).toBeUndefined();
    return (result.data as { prose: Record<string, unknown> | null }).prose;
  };

  const english = exampleDataset.entities.find(
    (entity) => entity.uri === MULTILINGUAL_ENTITY_URI,
  )?.prose?.en;
  const french = exampleDataset.entities.find(
    (entity) => entity.uri === MULTILINGUAL_ENTITY_URI,
  )?.prose?.fr;

  it("serves the default language with no context at all", async () => {
    expect(await ask({ uri: MULTILINGUAL_ENTITY_URI })).toMatchObject({
      lang: "en",
      availableLanguages: ["en", "fr"],
      markdown: english,
      asked: english,
    });
  });

  it("serves the context's locale when it is authored", async () => {
    expect(
      await ask({ uri: MULTILINGUAL_ENTITY_URI }, { locale: "fr" }),
    ).toMatchObject({ lang: "fr", markdown: french });
  });

  it("serves the default language for an unauthored locale", async () => {
    expect(
      await ask({ uri: MULTILINGUAL_ENTITY_URI }, { locale: "de" }),
    ).toMatchObject({ lang: "en", markdown: english });
  });

  it("serves the language markdown(lang:) asks for, else the locale", async () => {
    expect(
      await ask({ uri: MULTILINGUAL_ENTITY_URI, lang: "fr" }, {}),
    ).toMatchObject({ lang: "en", markdown: english, asked: french });
    expect(
      await ask({ uri: MULTILINGUAL_ENTITY_URI, lang: "de" }, { locale: "fr" }),
    ).toMatchObject({ asked: french });
  });

  it("serves the language markdown(lang:) asks for over the locale", async () => {
    expect(
      await ask({ uri: MULTILINGUAL_ENTITY_URI, lang: "en" }, { locale: "fr" }),
    ).toMatchObject({ lang: "fr", markdown: french, asked: english });
  });

  it("resolves the links that name entities or classes, in order of first mention", async () => {
    const prose = await ask({ uri: MULTILINGUAL_ENTITY_URI });
    expect(prose?.references).toEqual({
      edges: [
        {
          cursor: toCursor("https://metro.example/onto#north-line"),
          node: {
            __typename: "Line",
            uri: "https://metro.example/onto#north-line",
          },
        },
        {
          cursor: toCursor(SECOND_NAMESPACE_ENTITY_URI),
          node: { __typename: "Zone", uri: SECOND_NAMESPACE_ENTITY_URI },
        },
        {
          cursor: toCursor("https://metro.example/onto#circle-line"),
          node: {
            __typename: "Line",
            uri: "https://metro.example/onto#circle-line",
          },
        },
        {
          cursor: toCursor("https://metro.example/onto#Station"),
          node: {
            __typename: "OntologyClass",
            uri: "https://metro.example/onto#Station",
          },
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: toCursor("https://metro.example/onto#north-line"),
        endCursor: toCursor("https://metro.example/onto#Station"),
      },
    });
  });

  it("is null for an entity without prose, and for a value that is not an IRI", async () => {
    expect(await ask({ uri: BARE_ENTITY_URI })).toBeNull();
    expect(await ask({ uri: "metro:northgate" })).toBeNull();
  });
});

describe("Query.search", () => {
  const M = "https://metro.example/onto#";
  const GEO = "https://geo.example/onto#";

  /** The page selection every case reads. */
  const SEARCH = `query Search($text: String!, $first: Int, $after: String) {
    search(text: $text, first: $first, after: $after) {
      edges { cursor node { __typename uri } }
      pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
    }
  }`;

  /** The page `search` answers with. */
  interface SearchPage {
    readonly edges: readonly {
      readonly cursor: string;
      readonly node: { readonly __typename: string; readonly uri: string };
    }[];
    readonly pageInfo: Record<string, unknown>;
  }

  /** Run `SEARCH` with `variables`; the page must come back without errors. */
  const search = async (
    variables: Record<string, unknown>,
  ): Promise<SearchPage> =>
    ((await run(SEARCH, variables)) as { search: SearchPage }).search;

  /** The nodes of the page for `text`, in rank order. */
  const rank = async (text: string) =>
    (await search({ text })).edges.map((edge) => edge.node);

  it("ranks titles matching at one position by length, shortest first", async () => {
    expect(await rank("north")).toEqual([
      { __typename: "Station", uri: `${M}northgate` },
      { __typename: "Line", uri: `${M}north-line` },
    ]);
  });

  it("orders titles of one length by code point", async () => {
    expect(await rank("coastal")).toEqual([
      { __typename: "Line", uri: `${M}coastal-line` },
      { __typename: "Zone", uri: `${GEO}coastal-zone` },
    ]);
  });

  it("ranks a title match, a class's included, before a definition match", async () => {
    expect(await rank("fare")).toEqual([
      { __typename: "OntologyClass", uri: `${GEO}Zone` },
      { __typename: "Zone", uri: `${GEO}central-zone` },
    ]);
  });

  it("pages the ranking with first and after", async () => {
    const head = await search({ text: "line", first: 2 });
    expect(head.edges.map((edge) => edge.node.uri)).toEqual([
      `${M}Line`,
      `${M}north-line`,
    ]);
    expect(head.pageInfo).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: toCursor(`${M}Line`),
      endCursor: toCursor(`${M}north-line`),
    });
    const middle = await search({
      text: "line",
      first: 4,
      after: head.pageInfo.endCursor,
    });
    expect(middle.edges.map((edge) => edge.node.uri)).toEqual([
      `${M}circle-line`,
      `${M}upland-line`,
      `${M}coastal-line`,
      `${M}lowland-line`,
    ]);
    expect(middle.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: true,
    });
    const tail = await search({
      text: "line",
      first: 4,
      after: middle.pageInfo.endCursor,
    });
    expect(tail.edges.map((edge) => edge.node)).toEqual([
      { __typename: "OntologyClass", uri: `${M}Interchange` },
      { __typename: "OntologyClass", uri: `${M}Route` },
    ]);
    expect(tail.pageInfo).toEqual({
      hasNextPage: false,
      hasPreviousPage: true,
      startCursor: toCursor(`${M}Interchange`),
      endCursor: toCursor(`${M}Route`),
    });
  });

  it("trims the text and ignores its case", async () => {
    expect(await rank("  NORTH  ")).toEqual(await rank("north"));
  });

  it("answers empty text with the empty page", async () => {
    expect(await search({ text: "" })).toEqual({
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    });
  });

  it("finds an entity with no labels by the local name its title falls back to", async () => {
    expect(await rank("ghost")).toEqual([
      { __typename: "Station", uri: BARE_ENTITY_URI },
    ]);
  });

  it("starts from the head after a cursor it does not know", async () => {
    const page = await search({
      text: "north",
      first: 1,
      after: toCursor(`${M}nowhere`),
    });
    expect(page.edges.map((edge) => edge.node.uri)).toEqual([`${M}northgate`]);
  });

  it("refuses a negative first", async () => {
    const result = await graphql({
      schema: provider.schema,
      source: SEARCH,
      rootValue: provider.rootValue,
      variableValues: { text: "north", first: -1 },
    });
    expect(result.errors?.map((error) => error.message)).toEqual([
      "first must not be negative (received -1)",
    ]);
  });
});

describe("Query.ontologies / ontology", () => {
  it("returns every loaded namespace", async () => {
    const data = await run(`{ ontologies { prefix namespace label } }`);
    expect(data.ontologies).toEqual([
      {
        prefix: "metro",
        namespace: "https://metro.example/onto#",
        label: "Metro Network Ontology",
      },
      { prefix: "geo", namespace: "https://geo.example/onto#", label: null },
      {
        prefix: "rdfs",
        namespace: "http://www.w3.org/2000/01/rdf-schema#",
        label: "RDF Schema",
      },
    ]);
  });

  it("scopes classes and properties to the namespace", async () => {
    const data = await run(
      `{ ontology(prefix: "geo") { classes { uri } properties { uri } } }`,
    );
    expect(data.ontology).toEqual({
      classes: [
        { uri: GEO_POINT_CLASS_URI },
        { uri: "https://geo.example/onto#Zone" },
      ],
      properties: [
        { uri: "https://geo.example/onto#location" },
        { uri: "https://geo.example/onto#latitude" },
        { uri: "https://geo.example/onto#longitude" },
        { uri: "https://geo.example/onto#inZone" },
        { uri: "https://geo.example/onto#stops" },
      ],
    });
  });

  it("is null for an unknown prefix", async () => {
    const data = await run(`{ ontology(prefix: "nope") { prefix } }`);
    expect(data.ontology).toBeNull();
  });
});

describe("Query.ontologyClass", () => {
  it("accepts the prefixed convenience form", async () => {
    const data = await run(`{ ontologyClass(uri: "metro:Station") { uri } }`);
    expect(data.ontologyClass).toEqual({
      uri: "https://metro.example/onto#Station",
    });
  });

  it("accepts the absolute IRI", async () => {
    const data = await run(
      `{ ontologyClass(uri: "https://metro.example/onto#Station") { uri } }`,
    );
    expect(data.ontologyClass).toEqual({
      uri: "https://metro.example/onto#Station",
    });
  });

  it("is null for an unknown class", async () => {
    const data = await run(`{ ontologyClass(uri: "metro:Nope") { uri } }`);
    expect(data.ontologyClass).toBeNull();
  });

  it("resolves the hierarchy transitively", async () => {
    const data = await run(`{
      ontologyClass(uri: "metro:Interchange") {
        isAbstract namespace
        superclass { uri }
        superclasses { uri }
        subclasses { uri }
      }
    }`);
    expect(data.ontologyClass).toEqual({
      isAbstract: false,
      namespace: "https://metro.example/onto#",
      superclass: { uri: "https://metro.example/onto#Station" },
      superclasses: [
        { uri: "https://metro.example/onto#Station" },
        { uri: "https://metro.example/onto#Stop" },
      ],
      subclasses: [],
    });
  });

  it("reports a null superclass and real subclasses for a root class", async () => {
    const data = await run(
      `{ ontologyClass(uri: "metro:Stop") { isAbstract superclass { uri } superclasses { uri } subclasses { uri } } }`,
    );
    expect(data.ontologyClass).toEqual({
      isAbstract: true,
      superclass: null,
      superclasses: [],
      subclasses: [{ uri: "https://metro.example/onto#Station" }],
    });
  });

  it("marks own properties own and ancestors' properties inherited", async () => {
    const data = await run(`{
      ontologyClass(uri: "metro:Station") {
        properties { required singular inherited property { uri } }
      }
    }`);
    const properties = (
      data.ontologyClass as {
        properties: {
          required: boolean;
          singular: boolean;
          inherited: boolean;
          property: { uri: string };
        }[];
      }
    ).properties;
    expect(properties).toEqual([
      {
        required: false,
        singular: true,
        inherited: false,
        property: { uri: "https://metro.example/onto#platformCount" },
      },
      // Declared after platformCount: the length of the shortest platform,
      // which a formation's length is compared with.
      {
        required: false,
        singular: true,
        inherited: false,
        property: { uri: "https://metro.example/onto#platformLength" },
      },
      {
        required: true,
        singular: false,
        inherited: false,
        property: { uri: "https://metro.example/onto#servesLine" },
      },
      {
        required: false,
        singular: true,
        inherited: false,
        property: { uri: "https://geo.example/onto#location" },
      },
      {
        required: false,
        singular: true,
        inherited: false,
        property: { uri: "https://geo.example/onto#inZone" },
      },
      {
        required: false,
        singular: true,
        inherited: false,
        property: { uri: "https://metro.example/onto#diagramPosition" },
      },
      {
        required: true,
        singular: true,
        inherited: true,
        property: { uri: "https://metro.example/onto#name" },
      },
      {
        required: false,
        singular: true,
        inherited: true,
        property: { uri: "https://metro.example/onto#note" },
      },
    ]);
  });
});

describe("OntologyClass.instances", () => {
  it("counts subclass instances as instances of the superclass", async () => {
    const data = await run(`{
      station: ontologyClass(uri: "metro:Station") { instanceCount }
      interchange: ontologyClass(uri: "metro:Interchange") { instanceCount }
      line: ontologyClass(uri: "metro:Line") { instanceCount }
    }`);
    // 22 direct stations, one of them bare, plus 4 interchanges.
    expect(data.station).toEqual({ instanceCount: 26 });
    // Central Exchange, Riverside Junction, Tannery Lane, Eastwick Cross.
    expect(data.interchange).toEqual({ instanceCount: 4 });
    // North, Circle and Coastal, plus Upland, Lowland and the two Ringways.
    expect(data.line).toEqual({ instanceCount: 7 });
  });

  it("counts the fleet's stocks, formations, car types and units", async () => {
    const data = await run(`{
      stock: ontologyClass(uri: "metro:RollingStock") { instanceCount }
      formation: ontologyClass(uri: "metro:Formation") { instanceCount }
      carType: ontologyClass(uri: "metro:CarType") { instanceCount }
      unit: ontologyClass(uri: "metro:Unit") { instanceCount }
    }`);
    // Series 70, Series 90 and Series 50.
    expect(data.stock).toEqual({ instanceCount: 3 });
    // Series 70 fixed, Series 90 three-car and six-car, Series 50 four-car.
    expect(data.formation).toEqual({ instanceCount: 4 });
    // Driving, motor and trailer cars of Series 70; driving and trailer
    // cars of Series 90 and of Series 50.
    expect(data.carType).toEqual({ instanceCount: 7 });
    // One unit per series: 70, 90 and 50.
    expect(data.unit).toEqual({ instanceCount: 3 });
  });

  it("counts nothing for a class with no ABox members", async () => {
    const data = await run(
      `{ ontologyClass(uri: "rdfs:Class") { instanceCount instances { edges { cursor } } } }`,
    );
    expect(data.ontologyClass).toEqual({
      instanceCount: 0,
      instances: { edges: [] },
    });
  });

  it("pages forward with a real hasNextPage", async () => {
    const data = await run(`{
      ontologyClass(uri: "metro:Station") {
        instances(first: 3) {
          edges { cursor node { uri } }
          pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
        }
      }
    }`);
    const instances = (
      data.ontologyClass as {
        instances: {
          edges: { cursor: string; node: { uri: string } }[];
          pageInfo: Record<string, unknown>;
        };
      }
    ).instances;
    expect(instances.edges).toHaveLength(3);
    expect(instances.pageInfo).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: instances.edges[0]?.cursor,
      endCursor: instances.edges[2]?.cursor,
    });
  });

  it("pages backward from the tail", async () => {
    const data = await run(`{
      ontologyClass(uri: "metro:Station") {
        instances(last: 2) { edges { node { uri } } pageInfo { hasNextPage hasPreviousPage } }
      }
    }`);
    expect(data.ontologyClass).toEqual({
      instances: {
        edges: [
          { node: { uri: "https://metro.example/onto#verge-park" } },
          { node: { uri: "https://metro.example/onto#willowbank" } },
        ],
        pageInfo: { hasNextPage: false, hasPreviousPage: true },
      },
    });
  });

  it("resumes from a cursor", async () => {
    const after = toCursor("https://metro.example/onto#central-exchange");
    const data = await run(`{
      ontologyClass(uri: "metro:Station") {
        instances(first: 1, after: "${after}") { edges { node { uri } } }
      }
    }`);
    expect(data.ontologyClass).toEqual({
      instances: {
        edges: [{ node: { uri: "https://metro.example/onto#dyers-green" } }],
      },
    });
  });

  it("reports null cursors for an empty page", async () => {
    const data = await run(
      `{ ontologyClass(uri: "metro:Station") { instances(first: 0) { pageInfo { startCursor endCursor } } } }`,
    );
    expect(data.ontologyClass).toEqual({
      instances: { pageInfo: { startCursor: null, endCursor: null } },
    });
  });
});

describe("Query.ontologyProperty", () => {
  it("resolves every field, including a round-tripping inverse", async () => {
    const data = await run(`{
      ontologyProperty(uri: "metro:servesLine") {
        uri label definition range kind functional namespace
        domain { uri }
        inverse { uri kind inverse { uri } }
      }
    }`);
    expect(data.ontologyProperty).toEqual({
      uri: "https://metro.example/onto#servesLine",
      label: "serves line",
      definition: null,
      range: "metro:Line",
      kind: "OBJECT",
      functional: false,
      namespace: "https://metro.example/onto#",
      domain: { uri: "https://metro.example/onto#Station" },
      inverse: {
        uri: "https://metro.example/onto#servedBy",
        kind: "OBJECT",
        inverse: { uri: "https://metro.example/onto#servesLine" },
      },
    });
  });

  it("serves all three PropertyKind members", async () => {
    const data = await run(`{
      datatype: ontologyProperty(uri: "metro:name") { kind functional domain { uri } }
      object: ontologyProperty(uri: "metro:servesLine") { kind }
      annotation: ontologyProperty(uri: "metro:note") { kind functional inverse { uri } }
    }`);
    expect(data.datatype).toEqual({
      kind: "DATATYPE",
      functional: true,
      domain: null,
    });
    expect(data.object).toEqual({ kind: "OBJECT" });
    expect(data.annotation).toEqual({
      kind: "ANNOTATION",
      functional: false,
      inverse: null,
    });
  });

  it("round-trips a fare zone's stops and a station's zone as inverses", async () => {
    const data = await run(`{
      ontologyProperty(uri: "geo:stops") {
        uri label range kind functional
        domain { uri }
        inverse { uri functional inverse { uri } }
      }
    }`);
    expect(data.ontologyProperty).toEqual({
      uri: "https://geo.example/onto#stops",
      label: "stops",
      range: "metro:Stop",
      kind: "OBJECT",
      functional: false,
      domain: { uri: "https://geo.example/onto#Zone" },
      inverse: {
        uri: "https://geo.example/onto#inZone",
        functional: true,
        inverse: { uri: "https://geo.example/onto#stops" },
      },
    });
  });

  it("is null for an unknown property", async () => {
    const data = await run(`{ ontologyProperty(uri: "metro:nope") { uri } }`);
    expect(data.ontologyProperty).toBeNull();
  });

  it("makes metro:reverse its own inverse, since it is symmetric", async () => {
    const data = await run(`{
      ontologyProperty(uri: "metro:reverse") { uri functional inverse { uri } }
    }`);
    expect(data.ontologyProperty).toEqual({
      uri: "https://metro.example/onto#reverse",
      functional: true,
      inverse: { uri: "https://metro.example/onto#reverse" },
    });
  });
});

describe("_meta", () => {
  it("serves the language-tagged fields off a multilingual entity", async () => {
    const data = await run(`{
      node(id: "${MULTILINGUAL_ENTITY_URI}") {
        _meta {
          title
          french: title(lang: "fr")
          label
          frenchLabel: label(lang: "fr")
          comment
          definition
          type { uri }
        }
      }
    }`);
    expect(data.node).toEqual({
      _meta: {
        title: "Northgate",
        french: "Porte-Nord",
        label: "Northgate",
        frenchLabel: "Porte-Nord",
        comment: null,
        definition: "The northern terminus.",
        type: { uri: "https://metro.example/onto#Station" },
      },
    });
  });

  it("makes a class an instance of the metaclass, which instances itself", async () => {
    const data = await run(`{
      ontologyClass(uri: "metro:Station") {
        _meta { title fields { inherited } type { uri _meta { type { uri } } } }
      }
    }`);
    expect(data.ontologyClass).toEqual({
      _meta: {
        title: "Station",
        fields: [],
        type: { uri: META_CLASS_URI, _meta: { type: { uri: META_CLASS_URI } } },
      },
    });
  });

  it("lists the entity's class fields, own then inherited", async () => {
    const data = await run(`{
      node(id: "${MULTILINGUAL_ENTITY_URI}") {
        _meta { fields { inherited property { uri } } }
      }
    }`);
    expect(data.node).toEqual({
      _meta: {
        fields: [
          {
            inherited: false,
            property: { uri: "https://metro.example/onto#platformCount" },
          },
          // platformLength follows platformCount, as the Station class
          // declares them.
          {
            inherited: false,
            property: { uri: "https://metro.example/onto#platformLength" },
          },
          {
            inherited: false,
            property: { uri: "https://metro.example/onto#servesLine" },
          },
          {
            inherited: false,
            property: { uri: "https://geo.example/onto#location" },
          },
          {
            inherited: false,
            property: { uri: "https://geo.example/onto#inZone" },
          },
          {
            inherited: false,
            property: { uri: "https://metro.example/onto#diagramPosition" },
          },
          {
            inherited: true,
            property: { uri: "https://metro.example/onto#name" },
          },
          {
            inherited: true,
            property: { uri: "https://metro.example/onto#note" },
          },
        ],
      },
    });
  });

  it("looks a field up by the exact `name` it serves, and misses cleanly", async () => {
    const data = await run(`{
      node(id: "${MULTILINGUAL_ENTITY_URI}") {
        _meta {
          own: field(name: "platformCount") { name required singular inherited }
          inherited: field(name: "name") { name required inherited }
          miss: field(name: "nope") { name }
          notTheIri: field(name: "https://metro.example/onto#name") { name }
        }
      }
    }`);
    expect(data.node).toEqual({
      _meta: {
        own: {
          name: "platformCount",
          required: false,
          singular: true,
          inherited: false,
        },
        inherited: { name: "name", required: true, inherited: true },
        miss: null,
        // The key is `ClassProperty.name`, not the IRI. Only what `fields`
        // publishes is accepted — that is what "round-trips" means.
        notTheIri: null,
      },
    });
  });

  it("publishes a `name` for every property, projected or not", async () => {
    const data = await run(`{
      node(id: "${MULTILINGUAL_ENTITY_URI}") { _meta { fields { name } } }
    }`);
    const names = (
      data.node as { _meta: { fields: { name: string }[] } }
    )._meta.fields.map((field) => field.name);
    // platformLength follows platformCount, as the Station class declares
    // them.
    expect(names).toEqual([
      "platformCount",
      "platformLength",
      "servesLine",
      "location",
      "inZone",
      "diagramPosition",
      "name",
      // Declared on the abstract `Stop` and inherited by every station. No
      // concrete type in `schema/extension.graphql` exposes a `note` field,
      // so this entry is the contract's LABEL fallback rather than an
      // address — see the next test.
      "note",
    ]);
  });

  it("accepts every PROJECTED name back, and only those", async () => {
    // The contract's rule, in two halves. `ClassProperty.name` is "the exact
    // string `EntityMeta.field(name:)` accepts" for a property that projects
    // a field — so those round-trip. For a property that projects no field on
    // this class, the same doc says "there is no name `field(name:)` would
    // accept; the OWL local name is returned as a label", so the round-trip
    // must NOT close. Answering with metadata there would hand a consumer a
    // field name it can never select.
    // platformLength is a field on Station, so it is projected too.
    const projected = [
      "platformCount",
      "platformLength",
      "servesLine",
      "location",
      "inZone",
      "diagramPosition",
      "name",
    ];
    for (const name of projected) {
      const roundTrip = await run(`{
        node(id: "${MULTILINGUAL_ENTITY_URI}") { _meta { field(name: "${name}") { name } } }
      }`);
      expect(roundTrip.node).toEqual({ _meta: { field: { name } } });
    }

    const unprojected = await run(`{
      node(id: "${MULTILINGUAL_ENTITY_URI}") { _meta { field(name: "note") { name } } }
    }`);
    expect(unprojected.node).toEqual({ _meta: { field: null } });
  });

  it("answers null for a real GraphQL field with no property behind it", async () => {
    // The other half of the gate. `namespace` IS a field on `OntologyClass`,
    // so the schema check passes — and the metaclass declares no properties,
    // so there is no `ClassProperty` to return. A class's `_meta.fields` is
    // empty by construction here; asking it for one must not invent an entry.
    const data = await run(`{
      ontologyClass(uri: "${META_CLASS_URI}") {
        _meta { fields { name } field(name: "namespace") { name } }
      }
    }`);
    expect(data.ontologyClass).toEqual({
      _meta: { fields: [], field: null },
    });
  });
});

describe("_meta.curie", () => {
  it("compacts against the entity's own namespace, per entity", async () => {
    const data = await run(`{
      metro: node(id: "${MULTILINGUAL_ENTITY_URI}") { _meta { curie } }
      geo: node(id: "${SECOND_NAMESPACE_ENTITY_URI}") { __typename _meta { curie } }
    }`);
    expect(data.metro).toEqual({ _meta: { curie: "metro:northgate" } });
    expect(data.geo).toEqual({
      __typename: "Zone",
      _meta: { curie: "geo:central-zone" },
    });
  });

  it("compacts classes too, including the metaclass", async () => {
    const data = await run(`{
      station: ontologyClass(uri: "metro:Station") { _meta { curie } }
      zone: ontologyClass(uri: "geo:Zone") { _meta { curie } }
      meta: ontologyClass(uri: "rdfs:Class") { _meta { curie } }
    }`);
    expect(data.station).toEqual({ _meta: { curie: "metro:Station" } });
    expect(data.zone).toEqual({ _meta: { curie: "geo:Zone" } });
    expect(data.meta).toEqual({ _meta: { curie: "rdfs:Class" } });
  });

  it("compacts to a bare prefix when the local name is empty", async () => {
    const data = await runWith(
      EMPTY_LOCAL_NAME_DATASET,
      `{ node(id: "${EMPTY_LOCAL_NAME_URI}") { _meta { curie } } }`,
    );
    expect(data.node).toEqual({ _meta: { curie: "metro:" } });
  });

  it("gives the embeddable its GraphQL type name, having no IRI of its own", async () => {
    // The contract's third tier, verbatim: "for a value with no IRI at all (an
    // embedded blank node) — the GraphQL type name". NOT the compacted class
    // IRI, which would read as `geo:GeoPoint` and look like an address the
    // value does not have.
    const data = await run(`{
      node(id: "${MULTILINGUAL_ENTITY_URI}") {
        ... on Station { location { _meta { curie } } }
      }
    }`);
    expect(data.node).toEqual({
      location: { _meta: { curie: "GeoPoint" } },
    });
  });

  it("is derivable by a client from Query.ontologies alone", async () => {
    const data = await run(`{
      ontologies { prefix namespace }
      node(id: "${SECOND_NAMESPACE_ENTITY_URI}") { uri _meta { curie } }
    }`);
    const ontologies = data.ontologies as {
      prefix: string;
      namespace: string;
    }[];
    const node = data.node as { uri: string; _meta: { curie: string } };
    const match = ontologies
      .filter((ontology) => node.uri.startsWith(ontology.namespace))
      .sort((a, b) => b.namespace.length - a.namespace.length)[0];
    expect(`${match?.prefix}:${node.uri.slice(match?.namespace.length)}`).toBe(
      node._meta.curie,
    );
  });

  it("falls back to the whole IRI when no namespace is declared", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [{ uri: "urn:C", isAbstract: false, properties: [] }],
        properties: [],
        entities: [{ uri: "urn:e1", type: "urn:C", typename: "Station" }],
      },
      `{ node(id: "urn:e1") { _meta { curie } } }`,
    );
    expect(data.node).toEqual({ _meta: { curie: "urn:e1" } });
  });

  it("prefers the longest matching namespace, so one cannot shadow another", async () => {
    const data = await runWith(
      {
        ontologies: [
          { prefix: "short", namespace: "urn:a:" },
          { prefix: "long", namespace: "urn:a:b:" },
        ],
        classes: [{ uri: "urn:a:b:C", isAbstract: false, properties: [] }],
        properties: [],
        entities: [
          { uri: "urn:a:b:e1", type: "urn:a:b:C", typename: "Station" },
        ],
      },
      `{ node(id: "urn:a:b:e1") { _meta { curie } } }`,
    );
    expect(data.node).toEqual({ _meta: { curie: "long:e1" } });
  });
});

describe("the awkward entities", () => {
  it("titles an entity with no descriptive predicates from its local name", async () => {
    const data = await run(`{
      node(id: "${BARE_ENTITY_URI}") {
        uri
        _meta { title label comment definition type { uri } }
        ... on Station { name platformCount location { latitude } servesLine { uri } }
      }
    }`);
    expect(data.node).toEqual({
      uri: BARE_ENTITY_URI,
      _meta: {
        title: "ghost",
        label: null,
        comment: null,
        definition: null,
        type: { uri: "https://metro.example/onto#Station" },
      },
      name: null,
      platformCount: null,
      location: null,
      servesLine: [],
    });
  });

  it("titles an entity whose local name is empty from the whole IRI", async () => {
    const data = await runWith(
      EMPTY_LOCAL_NAME_DATASET,
      `{ node(id: "${EMPTY_LOCAL_NAME_URI}") { _meta { title } } }`,
    );
    expect(data.node).toEqual({ _meta: { title: EMPTY_LOCAL_NAME_URI } });
  });
});

describe("the embeddable", () => {
  it("is reachable, carries _meta, and has no uri to be titled from", async () => {
    const data = await run(`{
      node(id: "${MULTILINGUAL_ENTITY_URI}") {
        ... on Station {
          location { latitude longitude _meta { title label type { uri } } }
        }
      }
    }`);
    expect(data.node).toEqual({
      location: {
        latitude: 51.5412,
        longitude: -0.1435,
        _meta: {
          title: "GeoPoint",
          label: null,
          type: { uri: GEO_POINT_CLASS_URI },
        },
      },
    });
  });

  it("cannot be reached through node(id:) — it has no identity", async () => {
    const data = await run(`{ node(id: "${GEO_POINT_CLASS_URI}") { uri } }`);
    expect(data.node).toEqual({ uri: GEO_POINT_CLASS_URI });
  });
});

describe("the provider's own relational fields", () => {
  it("walks a station to its lines and back again", async () => {
    const data = await run(`{
      node(id: "https://metro.example/onto#central-exchange") {
        ... on Interchange {
          name transferMinutes platformCount
          servesLine { uri name servedBy { uri } }
        }
      }
    }`);
    const node = data.node as {
      servesLine: { uri: string; servedBy: { uri: string }[] }[];
    };
    expect(node.servesLine.map((line) => line.uri)).toEqual([
      "https://metro.example/onto#north-line",
      "https://metro.example/onto#circle-line",
      "https://metro.example/onto#coastal-line",
    ]);
    expect(
      node.servesLine[0]?.servedBy.map((station) => station.uri),
    ).toContain("https://metro.example/onto#central-exchange");
  });

  it("serves a line's stops under their real types, interchanges included", async () => {
    // `servedBy` is the inverse of `servesLine`, and `Interchange` carries
    // that property too — so the list is genuinely mixed. Declared
    // `[Station!]!` it handed an interchange back wearing the wrong type name
    // and `... on Interchange` could not be written against it at all. The
    // `Stop` interface is what makes the declared type match the values.
    const data = await run(`{
      node(id: "https://metro.example/onto#north-line") {
        ... on Line {
          servedBy {
            __typename
            uri
            ... on Interchange { transferMinutes }
          }
        }
      }
    }`);
    const node = data.node as {
      servedBy: { __typename: string; uri: string; transferMinutes?: number }[];
    };
    expect(node.servedBy.map((stop) => stop.__typename)).toContain(
      "Interchange",
    );
    const interchange = node.servedBy.find(
      (stop) => stop.__typename === "Interchange",
    );
    expect(interchange?.transferMinutes).toEqual(expect.any(Number));
  });
});

describe("Zone.stops", () => {
  it("serves the stops inside a fare zone under their real types, in the dataset's order", async () => {
    const data = await run(`{
      node(id: "https://geo.example/onto#central-zone") {
        ... on Zone { stops { __typename uri } }
      }
    }`);
    expect(data.node).toEqual({
      stops: [
        {
          __typename: "Interchange",
          uri: "https://metro.example/onto#central-exchange",
        },
        {
          __typename: "Station",
          uri: "https://metro.example/onto#northgate",
        },
      ],
    });
  });
});

describe("Line.routes", () => {
  const NORTH_LINE = "https://metro.example/onto#north-line";

  it("serves the line's code, colour and both directions with numbered calls", async () => {
    const data = await run(`{
      node(id: "${NORTH_LINE}") {
        ... on Line {
          code colour
          routes {
            label isLoop
            calls { position stop { __typename uri } }
          }
        }
      }
    }`);
    const node = data.node as {
      code: string;
      colour: string;
      routes: {
        label: string;
        isLoop: boolean;
        calls: {
          position: number;
          stop: { __typename: string; uri: string };
        }[];
      }[];
    };
    expect(node.code).toBe("1");
    expect(node.colour).toBe("#c8102e");
    expect(node.routes.map((route) => [route.label, route.isLoop])).toEqual([
      ["To Marsh End", false],
      ["To Northgate", false],
    ]);
    for (const route of node.routes) {
      expect(route.calls.map((call) => call.position)).toEqual([1, 2, 3, 4, 5]);
    }
    expect(node.routes.at(0)?.calls.at(3)?.stop).toEqual({
      __typename: "Interchange",
      uri: "https://metro.example/onto#central-exchange",
    });
  });

  it("leads a route's reverse back to the route", async () => {
    const data = await run(`{
      node(id: "${NORTH_LINE}") {
        ... on Line { routes { label reverse { label reverse { label } } } }
      }
    }`);
    const node = data.node as {
      routes: {
        label: string;
        reverse: { label: string; reverse: { label: string } };
      }[];
    };
    for (const route of node.routes) {
      expect(route.reverse.reverse.label).toBe(route.label);
      expect(route.reverse.label).not.toBe(route.label);
    }
  });

  it("describes a route as a value: titled by its label, curie its typename", async () => {
    const data = await run(`{
      node(id: "${NORTH_LINE}") {
        ... on Line { routes { label _meta { title label curie type { uri } } } }
      }
    }`);
    const route = (
      data.node as {
        routes: {
          label: string;
          _meta: {
            title: string;
            label: string;
            curie: string;
            type: { uri: string };
          };
        }[];
      }
    ).routes.at(0);
    expect(route?._meta).toEqual({
      title: route?.label,
      label: route?.label,
      curie: "Route",
      type: { uri: ROUTE_CLASS_URI },
    });
  });

  it("publishes the route's fields, and each one round-trips", async () => {
    const data = await run(`{
      node(id: "${NORTH_LINE}") {
        ... on Line { routes { _meta { fields { name } } } }
      }
    }`);
    const names = (
      data.node as { routes: { _meta: { fields: { name: string }[] } }[] }
    ).routes
      .at(0)
      ?._meta.fields.map((field) => field.name);
    expect(names).toEqual(["label", "isLoop", "calls", "reverse"]);
    for (const name of names ?? []) {
      const roundTrip = await run(`{
        node(id: "${NORTH_LINE}") {
          ... on Line { routes { _meta { field(name: "${name}") { name } } } }
        }
      }`);
      const field = (
        roundTrip.node as {
          routes: { _meta: { field: { name: string } | null } }[];
        }
      ).routes.at(0)?._meta.field;
      expect(field).toEqual({ name });
    }
  });

  it("describes a call as a value of the Call class", async () => {
    const data = await run(`{
      node(id: "${NORTH_LINE}") {
        ... on Line { routes { calls { _meta { title curie type { uri } } } } }
      }
    }`);
    const call = (
      data.node as {
        routes: { calls: { _meta: Record<string, unknown> }[] }[];
      }
    ).routes
      .at(0)
      ?.calls.at(0);
    expect(call?._meta).toEqual({
      title: "Call",
      curie: "Call",
      type: { uri: CALL_CLASS_URI },
    });
  });
});

describe("Stop.diagramPosition", () => {
  it("places a routed station on the schematic grid, as a value", async () => {
    const data = await run(`{
      node(id: "${MULTILINGUAL_ENTITY_URI}") {
        ... on Stop { diagramPosition { x y _meta { title curie type { uri } } } }
      }
    }`);
    expect(data.node).toEqual({
      diagramPosition: {
        x: 0,
        y: 0,
        _meta: {
          title: "DiagramPoint",
          curie: "DiagramPoint",
          type: { uri: DIAGRAM_POINT_CLASS_URI },
        },
      },
    });
  });

  it("answers null for a station no route calls at", async () => {
    const data = await run(`{
      node(id: "${BARE_ENTITY_URI}") { ... on Stop { diagramPosition { x } } }
    }`);
    expect(data.node).toEqual({ diagramPosition: null });
  });
});

describe("RollingStock.formations", () => {
  it("lists the stock's alternative formations in authored order, shortest first", async () => {
    const data = await run(`{
      node(id: "${COUPLED_STOCK_URI}") {
        __typename
        ... on RollingStock { name formations { uri length } }
      }
    }`);
    expect(data.node).toEqual({
      __typename: "RollingStock",
      name: "Series 90",
      formations: [
        {
          uri: SINGLE_UNIT_FORMATION_URI,
          length: 60000,
        },
        {
          uri: COUPLED_FORMATION_URI,
          length: 120000,
        },
      ],
    });
  });

  it("publishes its fields, and each one round-trips", async () => {
    await expectFieldsRoundTrip(
      run,
      COUPLED_STOCK_URI,
      selectOnNode,
      readNodeMeta,
    );
  });
});

describe("Formation", () => {
  it("names the stock that lists it", async () => {
    const data = await run(`{
      node(id: "${COUPLED_FORMATION_URI}") { ... on Formation { stock { uri } } }
    }`);
    expect(data.node).toEqual({
      stock: { uri: COUPLED_STOCK_URI },
    });
  });

  it("numbers its units from the front, each with its way round", async () => {
    const data = await run(`{
      node(id: "${REVERSED_UNIT_FORMATION_URI}") {
        ... on Formation { units { position reversed unit { uri } } }
      }
    }`);
    expect(data.node).toEqual({
      units: [
        {
          position: 1,
          reversed: false,
          unit: { uri: ASYMMETRIC_UNIT_URI },
        },
        {
          position: 2,
          reversed: true,
          unit: { uri: ASYMMETRIC_UNIT_URI },
        },
      ],
    });
  });

  it("measures the formation as the sum of its units", async () => {
    // Two units of 60000 mm and 490 passengers each.
    const data = await run(`{
      node(id: "${COUPLED_FORMATION_URI}") { ... on Formation { length capacity } }
    }`);
    expect(data.node).toEqual({ length: 120000, capacity: 980 });
  });

  it("lists the lines run with it, in IRI order", async () => {
    const data = await run(`{
      node(id: "${COUPLED_FORMATION_URI}") { ... on Formation { lines { uri } } }
    }`);
    expect(data.node).toEqual({
      lines: [{ uri: MIXED_STOCK_LINE_URI }, { uri: OVERLONG_LINE_URI }],
    });
  });

  it("describes a unit position as a value of the UnitPosition class", async () => {
    const data = await run(`{
      node(id: "${COUPLED_FORMATION_URI}") {
        ... on Formation { units { _meta { title curie type { uri } } } }
      }
    }`);
    const unit = (
      data.node as { units: { _meta: Record<string, unknown> }[] }
    ).units.at(0);
    expect(unit?._meta).toEqual({
      title: "UnitPosition",
      curie: "UnitPosition",
      type: { uri: UNIT_POSITION_CLASS_URI },
    });
  });

  it("publishes its fields, and each one round-trips", async () => {
    await expectFieldsRoundTrip(
      run,
      COUPLED_FORMATION_URI,
      selectOnNode,
      readNodeMeta,
    );
  });

  it("publishes a unit position's fields, and each one round-trips", async () => {
    await expectFieldsRoundTrip(
      run,
      COUPLED_FORMATION_URI,
      (meta) => `... on Formation { units { ${meta} } }`,
      (node) =>
        assertPresent(
          (node as { units: { _meta: PublishedFields }[] }).units.at(0),
          "the formation has no unit",
        )._meta,
    );
  });
});

describe("Line.formations", () => {
  it("lists the formations a line is run with, in authored order", async () => {
    const data = await run(`{
      node(id: "${MIXED_STOCK_LINE_URI}") {
        ... on Line { formations { uri stock { uri } } }
      }
    }`);
    expect(data.node).toEqual({
      formations: [
        {
          uri: COUPLED_FORMATION_URI,
          stock: { uri: COUPLED_STOCK_URI },
        },
        {
          uri: REVERSED_UNIT_FORMATION_URI,
          stock: { uri: "https://metro.example/onto#series-50" },
        },
      ],
    });
  });
});

describe("CarType", () => {
  const DRIVING_CAR = "https://metro.example/onto#car-90-driving";

  it("serves its code, its cab and its measures", async () => {
    const data = await run(`{
      node(id: "${DRIVING_CAR}") {
        __typename
        ... on CarType { name code hasCab length capacity }
      }
    }`);
    expect(data.node).toEqual({
      __typename: "CarType",
      name: "Series 90 driving motor car",
      code: "DM",
      hasCab: true,
      length: 20000,
      capacity: 160,
    });
  });

  it("publishes its fields, and each one round-trips", async () => {
    await expectFieldsRoundTrip(run, DRIVING_CAR, selectOnNode, readNodeMeta);
  });
});

describe("Unit.cars", () => {
  const UNIT_90 = "https://metro.example/onto#unit-90";

  it("numbers the cars from the front, each with its car type and its way round", async () => {
    const data = await run(`{
      node(id: "${UNIT_90}") {
        ... on Unit { cars { position reversed carType { uri code } } }
      }
    }`);
    expect(data.node).toEqual({
      cars: [
        {
          position: 1,
          reversed: false,
          carType: {
            uri: "https://metro.example/onto#car-90-driving",
            code: "DM",
          },
        },
        {
          position: 2,
          reversed: false,
          carType: {
            uri: "https://metro.example/onto#car-90-trailer",
            code: "T",
          },
        },
        {
          position: 3,
          reversed: true,
          carType: {
            uri: "https://metro.example/onto#car-90-driving",
            code: "DM",
          },
        },
      ],
    });
  });

  it("measures the unit as the sum of its cars' car types", async () => {
    // 20000 + 20000 + 20000 mm, and 160 + 170 + 160 passengers.
    const data = await run(`{
      node(id: "${UNIT_90}") { ... on Unit { length capacity } }
    }`);
    expect(data.node).toEqual({ length: 60000, capacity: 490 });
  });

  it("describes a car position as a value of the CarPosition class", async () => {
    const data = await run(`{
      node(id: "${UNIT_90}") {
        ... on Unit { cars { _meta { title curie type { uri } } } }
      }
    }`);
    const car = (
      data.node as { cars: { _meta: Record<string, unknown> }[] }
    ).cars.at(0);
    expect(car?._meta).toEqual({
      title: "CarPosition",
      curie: "CarPosition",
      type: { uri: CAR_POSITION_CLASS_URI },
    });
  });

  it("publishes the unit's fields, and each one round-trips", async () => {
    await expectFieldsRoundTrip(run, UNIT_90, selectOnNode, readNodeMeta);
  });

  it("publishes a car position's fields, and each one round-trips", async () => {
    await expectFieldsRoundTrip(
      run,
      UNIT_90,
      (meta) => `... on Unit { cars { ${meta} } }`,
      (node) =>
        assertPresent(
          (node as { cars: { _meta: PublishedFields }[] }).cars.at(0),
          "the unit has no car",
        )._meta,
    );
  });
});

describe("Stop.platformLength", () => {
  it("serves the length of the station's shortest platform, in millimetres", async () => {
    const data = await run(`{
      node(id: "${SHORT_PLATFORM_STATION_URI}") {
        ... on Stop { platformLength }
      }
    }`);
    expect(data.node).toEqual({ platformLength: 100000 });
  });

  it("answers null for a station no route calls at", async () => {
    const data = await run(`{
      node(id: "${BARE_ENTITY_URI}") { ... on Stop { platformLength } }
    }`);
    expect(data.node).toEqual({ platformLength: null });
  });
});

describe("defensive paths, exercised with purpose-built datasets", () => {
  const cls = {
    uri: "urn:C",
    isAbstract: false,
    properties: [],
  } as const;

  it("drops an entity whose class the TBox does not declare", async () => {
    const data = await runWith(
      {
        ontologies: [{ prefix: "urn", namespace: "urn:" }],
        classes: [cls],
        properties: [],
        entities: [
          { uri: "urn:e1", type: "urn:Missing", typename: "Station" },
          { uri: "urn:e2", type: "urn:C", typename: "Station" },
        ],
      },
      `{ dropped: node(id: "urn:e1") { uri } kept: node(id: "urn:e2") { uri }
         c: ontologyClass(uri: "urn:C") { instanceCount } }`,
    );
    expect(data.dropped).toBeNull();
    expect(data.kept).toEqual({ uri: "urn:e2" });
    expect(data.c).toEqual({ instanceCount: 1 });
  });

  it("drops a class property whose property the TBox does not declare", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [
          {
            uri: "urn:C",
            isAbstract: false,
            properties: [
              { property: "urn:missing", required: true, singular: true },
              { property: "urn:real", required: false, singular: false },
            ],
          },
        ],
        properties: [
          {
            uri: "urn:real",
            range: "String",
            kind: "DATATYPE",
            functional: false,
          },
        ],
        entities: [],
      },
      `{ ontologyClass(uri: "urn:C") { properties { property { uri } } } }`,
    );
    expect(data.ontologyClass).toEqual({
      properties: [{ property: { uri: "urn:real" } }],
    });
  });

  it("terminates on a superclass cycle instead of recursing forever", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [
          {
            uri: "urn:A",
            superclass: "urn:B",
            isAbstract: false,
            properties: [],
          },
          {
            uri: "urn:B",
            superclass: "urn:A",
            isAbstract: false,
            properties: [],
          },
        ],
        properties: [],
        entities: [],
      },
      `{ ontologyClass(uri: "urn:A") { superclasses { uri } } }`,
    );
    expect(data.ontologyClass).toEqual({
      superclasses: [{ uri: "urn:B" }],
    });
  });

  it("ignores a superclass IRI the TBox does not declare", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [
          {
            uri: "urn:A",
            superclass: "urn:Gone",
            isAbstract: false,
            properties: [],
          },
        ],
        properties: [],
        entities: [],
      },
      `{ ontologyClass(uri: "urn:A") { superclass { uri } superclasses { uri } } }`,
    );
    expect(data.ontologyClass).toEqual({ superclass: null, superclasses: [] });
  });

  it("makes a class an instance of itself when no metaclass is declared", async () => {
    const data = await runWith(
      { ontologies: [], classes: [cls], properties: [], entities: [] },
      `{ ontologyClass(uri: "urn:C") { _meta { type { uri } } } }`,
    );
    expect(data.ontologyClass).toEqual({ _meta: { type: { uri: "urn:C" } } });
  });

  it("omits the embeddable when its class is not declared", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls],
        properties: [],
        entities: [
          {
            uri: "urn:e1",
            type: "urn:C",
            typename: "Station",
            location: { latitude: 1, longitude: 2 },
          },
        ],
      },
      `{ node(id: "urn:e1") { ... on Station { location { latitude } } } }`,
    );
    expect(data.node).toEqual({ location: null });
  });

  it("omits the diagram position when its class is not declared", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls],
        properties: [],
        entities: [
          {
            uri: "urn:e1",
            type: "urn:C",
            typename: "Station",
            diagramPosition: { x: 1, y: 2 },
          },
        ],
      },
      `{ node(id: "urn:e1") { ... on Station { diagramPosition { x } } } }`,
    );
    expect(data.node).toEqual({ diagramPosition: null });
  });

  it("nulls a zone reference that points at nothing", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls],
        properties: [],
        entities: [
          {
            uri: "urn:e1",
            type: "urn:C",
            typename: "Station",
            inZone: "urn:gone",
          },
          {
            uri: "urn:e2",
            type: "urn:C",
            typename: "Station",
            inZone: "urn:e3",
          },
          { uri: "urn:e3", type: "urn:C", typename: "Zone" },
          { uri: "urn:e4", type: "urn:C", typename: "Station" },
        ],
      },
      `{ dangling: node(id: "urn:e1") { ... on Station { inZone { uri } } }
         real: node(id: "urn:e2") { ... on Station { inZone { uri } } }
         unset: node(id: "urn:e4") { ... on Station { inZone { uri } } } }`,
    );
    expect(data.dangling).toEqual({ inZone: null });
    expect(data.real).toEqual({ inZone: { uri: "urn:e3" } });
    expect(data.unset).toEqual({ inZone: null });
  });

  it("skips a line reference that points at nothing", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls],
        properties: [],
        entities: [
          {
            uri: "urn:e1",
            type: "urn:C",
            typename: "Station",
            servesLine: ["urn:gone", "urn:e2"],
          },
          { uri: "urn:e2", type: "urn:C", typename: "Line" },
        ],
      },
      `{ node(id: "urn:e1") { ... on Station { servesLine { uri } } } }`,
    );
    expect(data.node).toEqual({ servesLine: [{ uri: "urn:e2" }] });
  });

  const routeClass = {
    uri: ROUTE_CLASS_URI,
    isAbstract: false,
    properties: [],
  } as const;
  const callClass = { uri: CALL_CLASS_URI, isAbstract: false, properties: [] };
  const lineQuery = `{ node(id: "urn:line") {
    ... on Line { routes { label calls { position stop { uri } } reverse { label } } }
  } }`;

  it("serves no routes when the Route class is not declared", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls, callClass],
        properties: [],
        entities: [
          {
            uri: "urn:line",
            type: "urn:C",
            typename: "Line",
            routes: [
              { key: "out", labels: { "": "Out" }, isLoop: false, calls: [] },
            ],
          },
        ],
      },
      lineQuery,
    );
    expect(data.node).toEqual({ routes: [] });
  });

  it("serves no routes for a line that declares none", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls, routeClass, callClass],
        properties: [],
        entities: [{ uri: "urn:line", type: "urn:C", typename: "Line" }],
      },
      lineQuery,
    );
    expect(data.node).toEqual({ routes: [] });
  });

  it("serves no calls when the Call class is not declared", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls, routeClass],
        properties: [],
        entities: [
          {
            uri: "urn:line",
            type: "urn:C",
            typename: "Line",
            routes: [
              {
                key: "out",
                labels: { "": "Out" },
                isLoop: false,
                calls: ["urn:s1"],
              },
            ],
          },
          { uri: "urn:s1", type: "urn:C", typename: "Station" },
        ],
      },
      lineQuery,
    );
    expect(data.node).toEqual({
      routes: [{ label: "Out", calls: [], reverse: null }],
    });
  });

  it("drops a call to a stop that is not served, and numbers the rest without a gap", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls, routeClass, callClass],
        properties: [],
        entities: [
          {
            uri: "urn:line",
            type: "urn:C",
            typename: "Line",
            routes: [
              {
                key: "out",
                labels: { "": "Out" },
                isLoop: false,
                calls: ["urn:s1", "urn:gone", "urn:s2"],
              },
            ],
          },
          { uri: "urn:s1", type: "urn:C", typename: "Station" },
          { uri: "urn:s2", type: "urn:C", typename: "Station" },
        ],
      },
      lineQuery,
    );
    expect(data.node).toEqual({
      routes: [
        {
          label: "Out",
          calls: [
            { position: 1, stop: { uri: "urn:s1" } },
            { position: 2, stop: { uri: "urn:s2" } },
          ],
          reverse: null,
        },
      ],
    });
  });

  it("answers a null reverse when the key names no route on the line", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls, routeClass, callClass],
        properties: [],
        entities: [
          {
            uri: "urn:line",
            type: "urn:C",
            typename: "Line",
            routes: [
              {
                key: "out",
                labels: { "": "Out" },
                isLoop: false,
                calls: [],
                reverse: "gone",
              },
            ],
          },
        ],
      },
      lineQuery,
    );
    expect(data.node).toEqual({
      routes: [{ label: "Out", calls: [], reverse: null }],
    });
  });

  const carPositionClass = {
    uri: CAR_POSITION_CLASS_URI,
    isAbstract: false,
    properties: [],
  } as const;
  const trailer = {
    uri: "urn:trailer",
    type: "urn:C",
    typename: "CarType",
    code: "T",
    hasCab: false,
    length: 15000,
    capacity: 120,
  } as const;
  const unitQuery = `{ node(id: "urn:unit") {
    ... on Unit { length capacity cars { position reversed carType { uri } } }
  } }`;

  it("serves no car positions when the CarPosition class is not declared", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls],
        properties: [],
        entities: [
          trailer,
          {
            uri: "urn:unit",
            type: "urn:C",
            typename: "Unit",
            cars: [{ carType: "urn:trailer", reversed: false }],
          },
        ],
      },
      unitQuery,
    );
    // The measures still count the car: only its position cannot be served.
    expect(data.node).toEqual({ length: 15000, capacity: 120, cars: [] });
  });

  it("drops a car whose car type is missing or of another type, numbering the rest without a gap", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls, carPositionClass],
        properties: [],
        entities: [
          trailer,
          { uri: "urn:station", type: "urn:C", typename: "Station" },
          {
            uri: "urn:unit",
            type: "urn:C",
            typename: "Unit",
            cars: [
              { carType: "urn:trailer", reversed: false },
              { carType: "urn:gone", reversed: false },
              { carType: "urn:station", reversed: false },
              { carType: "urn:trailer", reversed: true },
            ],
          },
        ],
      },
      unitQuery,
    );
    expect(data.node).toEqual({
      length: 30000,
      capacity: 240,
      cars: [
        { position: 1, reversed: false, carType: { uri: "urn:trailer" } },
        { position: 2, reversed: true, carType: { uri: "urn:trailer" } },
      ],
    });
  });

  const unitPositionClass = {
    uri: UNIT_POSITION_CLASS_URI,
    isAbstract: false,
    properties: [],
  } as const;
  const trailerUnit = {
    uri: "urn:unit",
    type: "urn:C",
    typename: "Unit",
    cars: [{ carType: "urn:trailer", reversed: false }],
  } as const;
  const formationQuery = `{ node(id: "urn:formation") {
    ... on Formation { length capacity units { position reversed unit { uri } } }
  } }`;

  it("serves no unit positions when the UnitPosition class is not declared", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls],
        properties: [],
        entities: [
          trailer,
          trailerUnit,
          {
            uri: "urn:formation",
            type: "urn:C",
            typename: "Formation",
            units: [{ unit: "urn:unit", reversed: false }],
          },
        ],
      },
      formationQuery,
    );
    expect(data.node).toEqual({ length: 15000, capacity: 120, units: [] });
  });

  it("drops a unit that is missing or of another type, numbering the rest without a gap", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls, unitPositionClass],
        properties: [],
        entities: [
          trailer,
          trailerUnit,
          {
            uri: "urn:formation",
            type: "urn:C",
            typename: "Formation",
            units: [
              { unit: "urn:unit", reversed: false },
              { unit: "urn:gone", reversed: false },
              { unit: "urn:trailer", reversed: false },
              { unit: "urn:unit", reversed: true },
            ],
          },
        ],
      },
      formationQuery,
    );
    expect(data.node).toEqual({
      length: 30000,
      capacity: 240,
      units: [
        { position: 1, reversed: false, unit: { uri: "urn:unit" } },
        { position: 2, reversed: true, unit: { uri: "urn:unit" } },
      ],
    });
  });

  it("skips a line's or a stock's formation reference that points at nothing", async () => {
    const formation = {
      uri: "urn:formation",
      type: "urn:C",
      typename: "Formation",
      units: [],
    } as const;
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls],
        properties: [],
        entities: [
          formation,
          { uri: "urn:station", type: "urn:C", typename: "Station" },
          {
            uri: "urn:line",
            type: "urn:C",
            typename: "Line",
            formations: ["urn:gone", "urn:station", "urn:formation"],
          },
          {
            uri: "urn:stock",
            type: "urn:C",
            typename: "RollingStock",
            formations: ["urn:formation", "urn:gone"],
          },
        ],
      },
      `{ line: node(id: "urn:line") { ... on Line { formations { uri } } }
         stock: node(id: "urn:stock") { ... on RollingStock { formations { uri } } } }`,
    );
    expect(data.line).toEqual({ formations: [{ uri: "urn:formation" }] });
    expect(data.stock).toEqual({ formations: [{ uri: "urn:formation" }] });
  });

  it("serves no formations for a line that declares none, and runs none on it", async () => {
    const data = await runWith(
      {
        ontologies: [],
        classes: [cls],
        properties: [],
        entities: [
          { uri: "urn:line", type: "urn:C", typename: "Line" },
          {
            uri: "urn:formation",
            type: "urn:C",
            typename: "Formation",
            units: [],
          },
        ],
      },
      `{ line: node(id: "urn:line") { ... on Line { formations { uri } } }
         formation: node(id: "urn:formation") { ... on Formation { lines { uri } } } }`,
    );
    expect(data.line).toEqual({ formations: [] });
    expect(data.formation).toEqual({ lines: [] });
  });

  it("fails the non-null stock of a formation no stock lists, inventing none", async () => {
    // Asserted on `errors`, not through `runWith`: the failure is the
    // outcome under test. `stock` is non-null, so its null propagates up and
    // nulls the node.
    const custom = createExampleProvider({
      ontologies: [],
      classes: [cls],
      properties: [],
      entities: [
        {
          uri: "urn:formation",
          type: "urn:C",
          typename: "Formation",
          units: [],
        },
        {
          uri: "urn:stock",
          type: "urn:C",
          typename: "RollingStock",
          formations: [],
        },
      ],
    });
    const result = await graphql({
      schema: custom.schema,
      source: `{ node(id: "urn:formation") { ... on Formation { stock { uri } } } }`,
      rootValue: custom.rootValue,
    });
    expect(result.errors?.map((error) => error.message)).toEqual([
      "Cannot return null for non-nullable field Formation.stock.",
    ]);
    expect(result.data).toEqual({ node: null });
  });

  it("leaves an IRI whose scheme is not a declared prefix alone", async () => {
    const data = await runWith(
      {
        ontologies: [{ prefix: "https", namespace: "urn:trap:" }],
        classes: [{ uri: "urn:trap:C", isAbstract: false, properties: [] }],
        properties: [],
        entities: [],
      },
      `{ expanded: ontologyClass(uri: "https:C") { uri } }`,
    );
    // A prefix that collides with a URL scheme is pathological, and the
    // expansion is textual — this documents that, rather than pretending
    // the collision cannot happen.
    expect(data.expanded).toEqual({ uri: "urn:trap:C" });
  });
});

describe("prose, exercised with purpose-built datasets", () => {
  const station = exampleDataset.entities.find(
    (entity) => entity.uri === MULTILINGUAL_ENTITY_URI,
  );
  if (station === undefined) throw new Error("the dataset lost Northgate");

  /** The shipped dataset with Northgate's prose replaced by `prose`. */
  const withProse = (prose: Record<string, string>): ExampleDataset => ({
    ...exampleDataset,
    entities: [{ ...station, prose }],
  });

  it("serves prose that links to nothing as an empty page", async () => {
    const data = await runWith(
      withProse({ en: "No links, and [one external](https://example.com/)." }),
      `{ prose(uri: "${MULTILINGUAL_ENTITY_URI}") {
          references { edges { cursor } pageInfo { startCursor endCursor } }
        } }`,
    );
    expect(data.prose).toEqual({
      references: {
        edges: [],
        pageInfo: { startCursor: null, endCursor: null },
      },
    });
  });

  it("orders the languages after the default by code point", async () => {
    const data = await runWith(
      withProse({
        zh: "中文",
        en: "English",
        "pt-BR": "Português",
        de: "Deutsch",
      }),
      `{ prose(uri: "${MULTILINGUAL_ENTITY_URI}") { availableLanguages } }`,
    );
    expect(data.prose).toEqual({
      availableLanguages: ["en", "de", "pt-BR", "zh"],
    });
  });

  it("refuses prose with no default-language text", () => {
    expect(() => createExampleProvider(withProse({ fr: "Français" }))).toThrow(
      `${MULTILINGUAL_ENTITY_URI} has prose but none in the default language "en"`,
    );
  });
});

describe("the shipped dataset", () => {
  it("declares every entity's class", () => {
    const declared = new Set(exampleDataset.classes.map((each) => each.uri));
    for (const entity of exampleDataset.entities) {
      expect(declared).toContain(entity.type);
    }
  });

  it("declares every class property's property", () => {
    const declared = new Set(exampleDataset.properties.map((each) => each.uri));
    for (const each of exampleDataset.classes) {
      for (const cp of each.properties) {
        expect(declared).toContain(cp.property);
      }
    }
  });

  const lines = exampleDataset.entities
    .filter(isNetworkEntity)
    .filter((entity) => entity.typename === "Line");

  it("gives every line a unique code and a unique lowercase hex colour", () => {
    // The SDL makes both non-null, and the type cannot: a Line without them
    // would fail the field at query time.
    for (const line of lines) {
      expect(line.code).toEqual(expect.any(String));
      expect(line.colour).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(new Set(lines.map((line) => line.code)).size).toBe(lines.length);
    expect(new Set(lines.map((line) => line.colour)).size).toBe(lines.length);
  });

  it("keys routes uniquely per line and pairs every reverse both ways", () => {
    for (const line of lines) {
      const routes = line.routes ?? [];
      const byKey = new Map(routes.map((route) => [route.key, route]));
      expect(byKey.size).toBe(routes.length);
      for (const route of routes) {
        if (route.reverse !== undefined) {
          expect(byKey.get(route.reverse)?.reverse).toBe(route.key);
        }
      }
    }
  });
});

describe("the shipped fleet", () => {
  /** The IRIs of the shipped records of one type. */
  const collectUris = (typename: string): Set<string> =>
    new Set(
      exampleDataset.entities
        .filter((entity) => entity.typename === typename)
        .map((entity) => entity.uri),
    );

  const carTypeUris = collectUris("CarType");
  const unitUris = collectUris("Unit");
  const formations = exampleDataset.entities.flatMap((entity) =>
    entity.typename === "Formation" ? [entity] : [],
  );
  const stocks = exampleDataset.entities.flatMap((entity) =>
    entity.typename === "RollingStock" ? [entity] : [],
  );
  const lines = exampleDataset.entities.flatMap((entity) =>
    entity.typename === "Line" ? [entity] : [],
  );

  it("runs every line with at least one formation", () => {
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      expect(line.formations ?? [], line.uri).not.toEqual([]);
    }
  });

  it("lists every formation in exactly one stock and runs it on at least one line", () => {
    expect(formations.length).toBeGreaterThan(0);
    for (const formation of formations) {
      const listing = stocks.filter((stock) =>
        stock.formations.includes(formation.uri),
      );
      expect(listing, formation.uri).toHaveLength(1);
      const running = lines.filter((line) =>
        (line.formations ?? []).includes(formation.uri),
      );
      expect(running.length, formation.uri).toBeGreaterThan(0);
    }
  });

  it("names a unit for every unit of every formation", () => {
    for (const formation of formations) {
      expect(formation.units.length, formation.uri).toBeGreaterThan(0);
      for (const placement of formation.units) {
        expect(unitUris, formation.uri).toContain(placement.unit);
      }
    }
  });

  it("names a car type for every car of every unit", () => {
    const units = exampleDataset.entities.flatMap((entity) =>
      entity.typename === "Unit" ? [entity] : [],
    );
    expect(units.length).toBeGreaterThan(0);
    for (const unit of units) {
      expect(unit.cars.length, unit.uri).toBeGreaterThan(0);
      for (const car of unit.cars) {
        expect(carTypeUris, unit.uri).toContain(car.carType);
      }
    }
  });

  it("gives every car type a positive length and capacity", () => {
    const carTypes = exampleDataset.entities.flatMap((entity) =>
      entity.typename === "CarType" ? [entity] : [],
    );
    expect(carTypes.length).toBeGreaterThan(0);
    for (const carType of carTypes) {
      expect(carType.length, carType.uri).toBeGreaterThan(0);
      expect(carType.capacity, carType.uri).toBeGreaterThan(0);
    }
  });
});

describe("determinism", () => {
  let first: Record<string, unknown>;

  beforeAll(async () => {
    first = await run(
      `{ ontologyClass(uri: "metro:Station") { instances(first: 5) { edges { cursor } } } }`,
    );
  });

  it("returns the same cursors across independent provider instances", async () => {
    const other = createExampleProvider();
    const result = await graphql({
      schema: other.schema,
      source: `{ ontologyClass(uri: "metro:Station") { instances(first: 5) { edges { cursor } } } }`,
      rootValue: other.rootValue,
    });
    expect(result.data).toEqual(first);
  });
});
