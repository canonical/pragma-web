// =============================================================================
// The metro serves each node's list values and a class's facet counts.
//
// `Query.facetedInstances` counts each facet value over the whole class with
// the facet's own filter lifted and the others kept, so a value's count is
// the `totalCount` the set would have with it applied. `Node.values` answers
// the fields a node's class's lens displays, in the lens's order.
// =============================================================================

import { deriveListFields, KIND_FACET_FIELD } from "@canonical/prism-contract";
import { graphql } from "graphql";
import { describe, expect, it } from "vitest";
import { createExampleProvider } from "../../lib/provider/createExampleProvider.js";

const provider = createExampleProvider();

const CIRCLE_LINE = "https://metro.example/onto#circle-line";

const STATION = "metro:Station";

interface FieldFilter {
  readonly field: string;
  readonly values: readonly (string | null)[];
}

interface FacetedInstances {
  readonly totalCount: number;
  readonly edges: readonly {
    readonly cursor: string;
    readonly node: { readonly uri: string };
  }[];
  readonly facets: readonly {
    readonly field: string;
    readonly values: readonly {
      readonly value: string | null;
      readonly count: number;
    }[];
  }[];
}

const FACETED_QUERY = `query Faceted($classUri: ID!, $filters: [FieldFilter!], $sort: FieldSort, $first: Int, $after: String) {
  facetedInstances(classUri: $classUri, filters: $filters, sort: $sort, first: $first, after: $after) {
    totalCount
    edges { cursor node { uri } }
    facets { field values { value count } }
  }
}`;

const run = async (
  source: string,
  variableValues: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  const result = await graphql({
    schema: provider.schema,
    rootValue: provider.rootValue,
    source,
    variableValues,
  });
  expect(result.errors).toBeUndefined();
  return result.data as Record<string, unknown>;
};

const facet = async (
  classUri: string,
  filters: readonly FieldFilter[] = [],
  extra: Record<string, unknown> = {},
): Promise<FacetedInstances> =>
  (await run(FACETED_QUERY, { classUri, filters, ...extra }))
    .facetedInstances as FacetedInstances;

const countValues = (selection: FacetedInstances, field: string) =>
  selection.facets.find((candidate) => candidate.field === field)?.values ?? [];

describe("Query.facetedInstances", () => {
  it("facets the stations by line, zone and kind, each with its none bucket", async () => {
    const stations = await facet(STATION);
    expect(stations.totalCount).toBe(26);
    expect(
      stations.facets.map(({ field, values }) => [
        field,
        values.filter((value) => value.value !== null).length,
        values.some((value) => value.value === null),
      ]),
    ).toEqual([
      ["servesLine", 7, true],
      ["inZone", 2, true],
      [KIND_FACET_FIELD.id, 2, false],
    ]);
  });

  it("leaves 6 of 26 stations under Line is Circle Line", async () => {
    const circle = await facet(STATION, [
      { field: "servesLine", values: [CIRCLE_LINE] },
    ]);
    expect(circle.totalCount).toBe(6);
    expect(circle.edges).toHaveLength(6);
  });

  it("counts each value as the total its filter would leave, the others kept", async () => {
    const active: readonly FieldFilter[] = [
      { field: "servesLine", values: [CIRCLE_LINE] },
      {
        field: KIND_FACET_FIELD.id,
        values: ["https://metro.example/onto#Station"],
      },
    ];
    const selection = await facet(STATION, active);
    for (const { field, values } of selection.facets) {
      const others = active.filter((filter) => filter.field !== field);
      for (const { value, count } of values) {
        const applied = await facet(STATION, [
          ...others,
          { field, values: [value] },
        ]);
        expect([field, value, applied.totalCount]).toEqual([
          field,
          value,
          count,
        ]);
      }
    }
  });

  it("serves no facet on the lines", async () => {
    expect((await facet("metro:Line")).facets).toEqual([]);
  });

  it("sorts by a field and pages the sorted set", async () => {
    const sorted = await facet(STATION, [], {
      sort: { field: "platformCount", descending: true },
      first: 3,
    });
    expect(sorted.totalCount).toBe(26);
    expect(sorted.edges).toHaveLength(3);
    expect(countValues(sorted, "servesLine")).not.toEqual([]);
  });

  it("pages on after a cursor", async () => {
    const readUris = (selection: FacetedInstances) =>
      selection.edges.map((edge) => edge.node.uri);
    const head = await facet(STATION, [], { first: 6 });
    const page = await facet(STATION, [], {
      first: 3,
      after: head.edges.at(2)?.cursor,
    });
    expect(readUris(page)).toEqual(readUris(head).slice(3));
  });

  it("refuses a sort the list cannot make", async () => {
    const result = await graphql({
      schema: provider.schema,
      rootValue: provider.rootValue,
      source: FACETED_QUERY,
      variableValues: { classUri: STATION, sort: { field: "servesLine" } },
    });
    expect(result.errors?.at(0)?.message).toBe(
      'the list has no field "servesLine" to sort by',
    );
  });
});

describe("Node.values", () => {
  it("answers a station's displayed fields in the lens's order", async () => {
    const data = await run(
      `query Values($id: ID!) {
        node(id: $id) {
          values { field label text uri }
          _meta { fields { name property { uri label kind range } singular group { uri label order } order role visibility } }
        }
      }`,
      { id: "https://metro.example/onto#central-exchange" },
    );
    const node = data.node as {
      values: readonly {
        field: string;
        text: string | null;
        uri: string | null;
      }[];
      _meta: { fields: Parameters<typeof deriveListFields>[0] };
    };
    expect(node.values.map((value) => value.field)).toEqual(
      deriveListFields(node._meta.fields).display.map((field) => field.field),
    );
    expect(node.values.find((value) => value.field === "inZone")).toMatchObject(
      { text: "Central Zone", uri: "https://geo.example/onto#central-zone" },
    );
  });

  it("answers the fields named, a class's too", async () => {
    const data = await run(
      `{ ontologyClass(uri: "metro:Line") { values(fields: ["label"]) { field } instances(first: 1) { edges { node { values(fields: ["code"]) { field text } } } } } }`,
      {},
    );
    expect(data).toEqual({
      ontologyClass: {
        values: [],
        instances: {
          edges: [{ node: { values: [{ field: "code", text: "2" }] } }],
        },
      },
    });
  });
});
