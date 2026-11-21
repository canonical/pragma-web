// =============================================================================
// The docs provider serves each node's list values and a class's facets.
//
// For the largest class that has facets, every facet value's count equals
// the `totalCount` `Query.facetedInstances` answers with that value applied,
// and `Node.values` answers the fields the node's class's lens displays.
// =============================================================================

import { executeLocal } from "@canonical/ke-graphql";
import {
  deriveListFields,
  type ServedClassField,
} from "@canonical/prism-contract";
import { parse } from "graphql";
import { beforeAll, describe, expect, it } from "vitest";
import { SITE_LENS } from "../../lib/lens/index.js";
import type { SearchIndexSources } from "../../lib/search/types.js";
import { installedRefRoots } from "../../lib/sources/index.js";
import { bootCorpusSchema } from "../bootCorpusSchema.js";

/** The boot compiles every installed ref package. */
const BOOT_TIMEOUT_MS = 60_000;

interface Faceted {
  readonly totalCount: number;
  readonly edges: readonly { readonly node: { readonly uri: string } }[];
  readonly facets: readonly {
    readonly field: string;
    readonly values: readonly {
      readonly value: string | null;
      readonly count: number;
    }[];
  }[];
}

const FACETED_QUERY = `query Faceted($classUri: ID!, $filters: [FieldFilter!]) {
  facetedInstances(classUri: $classUri, filters: $filters, first: 1000) {
    totalCount
    edges { node { uri } }
    facets { field values { value count } }
  }
}`;

let served: SearchIndexSources;
let classUri: string;

const run = async (
  source: string,
  variableValues: Record<string, unknown> = {},
): Promise<Record<string, unknown>> => {
  const result = (await executeLocal({
    schema: served.schema,
    source,
    document: parse(source),
    variableValues,
    contextValue: served.context,
  })) as { data?: Record<string, unknown>; errors?: unknown };
  if (result.errors !== undefined || result.data === undefined) {
    throw new Error(`the schema answered ${JSON.stringify(result.errors)}`);
  }
  return result.data;
};

const facet = async (
  filters: readonly { field: string; values: readonly (string | null)[] }[],
): Promise<Faceted> =>
  (await run(FACETED_QUERY, { classUri, filters })).facetedInstances as Faceted;

beforeAll(async () => {
  served = await bootCorpusSchema(SITE_LENS, installedRefRoots());
  const data = (await run(
    "{ ontologies { classes { uri instanceCount } } }",
  )) as {
    ontologies: readonly {
      classes: readonly { uri: string; instanceCount: number }[];
    }[];
  };
  const classes = data.ontologies
    .flatMap((ontology) => ontology.classes)
    .toSorted((a, b) => b.instanceCount - a.instanceCount);
  for (const candidate of classes) {
    classUri = candidate.uri;
    if ((await facet([])).facets.length > 0) return;
  }
}, BOOT_TIMEOUT_MS);

describe("Query.facetedInstances", () => {
  it("counts each facet value as the total its filter leaves", async () => {
    const whole = await facet([]);
    expect(whole.facets.length).toBeGreaterThan(0);
    expect(whole.edges).toHaveLength(whole.totalCount);
    for (const { field, values } of whole.facets) {
      for (const { value, count } of values) {
        const applied = await facet([{ field, values: [value] }]);
        expect([field, value, applied.totalCount]).toEqual([
          field,
          value,
          count,
        ]);
      }
    }
  });
});

describe("Node.values", () => {
  it("answers the displayed fields in the lens's order", async () => {
    const [first] = (await facet([])).edges;
    const data = (await run(
      `query Values($id: ID!) {
        node(id: $id) {
          values { field }
          _meta { fields { name property { uri label kind range } singular group { uri label order } order role visibility } }
        }
      }`,
      { id: first?.node.uri },
    )) as {
      node: {
        values: readonly { field: string }[];
        _meta: { fields: readonly ServedClassField[] };
      };
    };
    expect(data.node.values.map((value) => value.field)).toEqual(
      deriveListFields(data.node._meta.fields).display.map(
        (field) => field.field,
      ),
    );
  });
});
