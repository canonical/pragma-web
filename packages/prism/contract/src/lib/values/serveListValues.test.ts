import { describe, expect, it } from "vitest";
import { SERVED_STATION_FIELDS } from "../../testing/fixtures.js";
import { readContractSdl } from "../contractSdl.js";
import {
  CLASS_FIELDS_QUERY,
  CLASS_INSTANCES_QUERY,
  NODE_FIELDS_QUERY,
} from "./constants.js";
import { serveFacetedInstances, serveNodeValues } from "./serveListValues.js";
import type { RunQuery } from "./types.js";

const SDL = `${readContractSdl()}
type Station implements Node {
  uri: ID!
  _meta: EntityMeta!
  name: String
  platformCount: Int
  servesLine: [OntologyClass!]!
  zone: OntologyClass
}`;

const line = (id: string) => ({ uri: `ex:${id}`, _meta: { title: id } });

const STATIONS: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  "ex:a": { platformCount: 4, servesLine: [line("red")], zone: line("z1") },
  "ex:b": {
    platformCount: 2,
    servesLine: [line("red"), line("blue")],
    zone: null,
  },
  "ex:c": { platformCount: 3, servesLine: [line("red")], zone: line("z1") },
  "ex:d": { platformCount: null, servesLine: [line("blue")], zone: null },
};

/** The interchanges' class has no label: their kind reads as its IRI. */
const LABELS: Readonly<Record<string, string>> = {
  "ex:a": "Station",
  "ex:c": "Station",
};

const KINDS: Readonly<Record<string, string>> = {
  "ex:a": "Station",
  "ex:b": "Interchange",
  "ex:c": "Station",
  "ex:d": "Interchange",
};

/** Answers the four queries over two stations, an unknown node or class as null. */
const run: RunQuery = async (source, variables) => {
  const id = String(variables.id ?? variables.uri);
  if (source === NODE_FIELDS_QUERY) {
    return {
      node: Object.hasOwn(STATIONS, id)
        ? { __typename: "Station", _meta: { fields: SERVED_STATION_FIELDS } }
        : null,
    };
  }
  if (source === CLASS_FIELDS_QUERY) {
    return {
      ontologyClass:
        id === "ex:Station"
          ? { uri: id, properties: SERVED_STATION_FIELDS, instanceCount: 4 }
          : null,
    };
  }
  if (source === CLASS_INSTANCES_QUERY) {
    expect(variables.first).toBe(4);
    return {
      ontologyClass: {
        instances: {
          edges: Object.keys(STATIONS).map((uri) => ({
            node: {
              uri,
              __typename: "Station",
              _meta: {
                type: { uri: `ex:${KINDS[uri]}`, label: LABELS[uri] ?? null },
              },
            },
          })),
        },
      },
    };
  }
  return { node: STATIONS[id] ?? null };
};

describe("serveNodeValues", () => {
  it("answers the displayed fields in the lens's order without names", async () => {
    const values = await serveNodeValues(run, SDL, "ex:b");
    expect(values.map((value) => value.field)).toEqual([
      "servesLine",
      "platformCount",
      "note",
      "zone",
      "opened",
      "stepFree",
    ]);
    expect(values.slice(0, 2)).toMatchObject([
      { text: "red +1", uri: null },
      { text: "2", uri: null },
    ]);
  });

  it("answers the fields named, in their order, skipping unknown names", async () => {
    expect(
      await serveNodeValues(run, SDL, "ex:a", ["zone", "missing", "name"]),
    ).toEqual([
      {
        field: "zone",
        label: "zone",
        type: "choices",
        text: "z1",
        uri: "ex:z1",
      },
      { field: "name", label: "name", type: "text", text: null, uri: null },
    ]);
  });

  it("answers no values for a node the provider does not hold", async () => {
    expect(await serveNodeValues(run, SDL, "ex:none")).toEqual([]);
  });

  it("answers none for fields the node's type cannot read", async () => {
    expect(await serveNodeValues(run, SDL, "ex:a", ["note"])).toEqual([
      { field: "note", label: "note", type: "text", text: null, uri: null },
    ]);
  });
});

describe("serveFacetedInstances", () => {
  it("facets a class's instances by its fields and its kind", async () => {
    const selection = await serveFacetedInstances(run, SDL, {
      classUri: "ex:Station",
      filters: [{ field: "servesLine", values: ["ex:blue"] }],
    });
    expect(selection.uris).toEqual(["ex:b", "ex:d"]);
    expect(selection.facets.at(-1)?.values.map((value) => value.label)).toEqual(
      ["ex:Interchange", "Station"],
    );
    expect(selection.facets.map((facet) => facet.field)).toEqual([
      "servesLine",
      "zone",
      "kind",
    ]);
  });

  it("sorts by a field it reads only for the sort", async () => {
    const selection = await serveFacetedInstances(run, SDL, {
      classUri: "ex:Station",
      sort: { field: "platformCount" },
    });
    expect(selection.uris).toEqual(["ex:b", "ex:c", "ex:a", "ex:d"]);
  });

  it("answers an empty set for an unknown class", async () => {
    expect(
      await serveFacetedInstances(run, SDL, { classUri: "ex:Nothing" }),
    ).toEqual({ uris: [], totalCount: 0, facets: [] });
  });
});
