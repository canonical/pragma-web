// @vitest-environment node

/**
 * The type lens end to end: the metro provider is booted as the graph server
 * boots it, and every check is a GraphQL request through its fetch handler.
 * Stations lead, an interchange inherits a station's field sections, fare
 * zones are hidden and never reach a search result, and each class edge
 * covers the statements the graph holds.
 */

import {
  createExampleHandler,
  createExampleProvider,
} from "@canonical/prism-graph-example";
import { describe, expect, it } from "vitest";

/** The metro namespace the checked terms live in. */
const METRO = "https://metro.example/onto#";

/** The geography namespace fare zones live in. */
const GEO = "https://geo.example/onto#";

/** One GraphQL answer, as the handler serialises it. */
interface Answer {
  readonly data?: Record<string, unknown>;
  readonly errors?: readonly { readonly message: string }[];
}

/** One class edge, as `Query.classEdges` serves it. */
interface ClassEdge {
  readonly property: string;
  readonly subjectClass: string;
  readonly objectClass: string;
  readonly count: number;
  readonly declared: boolean;
}

const handle = createExampleHandler(createExampleProvider());

/** Send one query through the handler and return its data. */
const ask = async (query: string): Promise<Record<string, unknown>> => {
  const response = await handle(
    new Request("http://localhost/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    }),
  );
  const { data, errors } = (await response.json()) as Answer;
  if (errors !== undefined || data === undefined) {
    throw new Error(`the graph answered ${JSON.stringify(errors)}`);
  }
  return data;
};

/** Every class edge the graph serves. */
const readClassEdges = async (): Promise<readonly ClassEdge[]> =>
  (
    await ask(
      "{ classEdges { property subjectClass objectClass count declared } }",
    )
  ).classEdges as readonly ClassEdge[];

describe("the type lens", () => {
  it("lets stations lead, under their glyph and plural label", async () => {
    const data = await ask(
      '{ ontologyClass(uri: "metro:Station") { visibility glyph pluralLabel } }',
    );
    expect(data.ontologyClass).toEqual({
      visibility: "PROMINENT",
      glyph: "location",
      pluralLabel: "Stations",
    });
  });

  it("gives an interchange the section of a field it inherits from a station", async () => {
    const data = await ask(
      '{ ontologyClass(uri: "metro:Interchange") { properties { name inherited group { uri } order } } }',
    );
    const { properties } = data.ontologyClass as {
      readonly properties: readonly { readonly name: string }[];
    };
    expect(properties.find(({ name }) => name === "inZone")).toEqual({
      name: "inZone",
      inherited: true,
      group: { uri: `${METRO}section.place` },
      order: 2,
    });
  });

  it("hides fare zones, whose instances are values", async () => {
    const data = await ask(
      '{ ontologyClass(uri: "geo:Zone") { uri visibility instanceCount } }',
    );
    expect(data.ontologyClass).toEqual({
      uri: `${GEO}Zone`,
      visibility: "HIDDEN",
      instanceCount: 2,
    });
  });

  it("leaves a zone out of search, while the class stays searchable", async () => {
    const data = await ask(
      '{ search(text: "zone", first: 50) { edges { node { uri } } } }',
    );
    const { edges } = data.search as {
      readonly edges: readonly { readonly node: { readonly uri: string } }[];
    };
    expect(edges.map(({ node }) => node.uri)).toEqual([`${GEO}Zone`]);
  });
});

describe("the class edges", () => {
  it("counts the stations the graph places in a zone", async () => {
    const data = await ask(
      '{ ontologyClass(uri: "metro:Station") { instances(first: 500) { edges { node { ... on Station { inZone { uri } } ... on Interchange { inZone { uri } } } } } } }',
    );
    const { instances } = data.ontologyClass as {
      readonly instances: {
        readonly edges: readonly {
          readonly node: { readonly inZone?: { readonly uri: string } | null };
        }[];
      };
    };
    const zoned = instances.edges.filter(
      ({ node }) => node.inZone !== null && node.inZone !== undefined,
    );
    expect(zoned.length).toBeGreaterThan(0);
    expect(
      (await readClassEdges()).find(
        ({ property }) => property === `${GEO}inZone`,
      ),
    ).toEqual({
      property: `${GEO}inZone`,
      subjectClass: `${METRO}Station`,
      objectClass: `${GEO}Zone`,
      count: zoned.length,
      declared: true,
    });
  });

  it("serves a declared edge no statement covers with count 0", async () => {
    expect(
      (await readClassEdges()).find(
        ({ property }) => property === `${METRO}servedBy`,
      ),
    ).toMatchObject({ count: 0, declared: true });
  });

  it("marks an observed pair the ontology does not declare", async () => {
    expect(
      (await readClassEdges()).filter(
        ({ property }) => property === `${METRO}formations`,
      ),
    ).toEqual([
      {
        property: `${METRO}formations`,
        subjectClass: `${METRO}Line`,
        objectClass: `${METRO}Formation`,
        count: expect.any(Number),
        declared: false,
      },
      {
        property: `${METRO}formations`,
        subjectClass: `${METRO}RollingStock`,
        objectClass: `${METRO}Formation`,
        count: expect.any(Number),
        declared: false,
      },
    ]);
  });
});
