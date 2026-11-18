import { describe, expect, it } from "vitest";
import { KIND_FACET_FIELD } from "./constants.js";
import { selectFacetedInstances } from "./selectFacetedInstances.js";
import type { FacetRow, ListField } from "./types.js";

const field = (id: string, extra: Partial<ListField>): ListField => ({
  id,
  property: `http://example.org/${id}`,
  type: "text",
  label: id,
  group: null,
  role: null,
  prominent: false,
  enableSorting: false,
  facetable: false,
  ...extra,
});

const FIELDS: readonly ListField[] = [
  field("line", { type: "choices", label: "Line", facetable: true }),
  field("platforms", { type: "number", enableSorting: true }),
  field("name", { enableSorting: true }),
  field("stepFree", { type: "flag", facetable: true }),
  KIND_FACET_FIELD,
];

const line = (id: string) => ({ text: `${id} line`, uri: `ex:${id}` });
const kind = (id: string) => [{ text: id, uri: `ex:${id}` }];

const ROWS: readonly FacetRow[] = [
  {
    uri: "ex:a",
    values: {
      line: [line("red"), line("blue")],
      platforms: [{ text: "10", uri: null }],
      stepFree: [{ text: "true", uri: null }],
      name: [{ text: "Alpha", uri: null }],
      kind: kind("Station"),
    },
  },
  {
    uri: "ex:b",
    values: {
      line: [line("red")],
      platforms: [{ text: "9", uri: null }],
      stepFree: [{ text: "false", uri: null }],
      name: [{ text: "Alpha", uri: null }],
      kind: kind("Interchange"),
    },
  },
  { uri: "ex:c", values: { line: [], kind: kind("Station") } },
];

/** The set twice over, so that each facet groups its nodes. */
const PAIRED: readonly FacetRow[] = [
  ...ROWS,
  ...ROWS.map((row) => ({ ...row, uri: `${row.uri}2` })),
];

describe("selectFacetedInstances", () => {
  it("keeps the whole set in IRI order without filters or sort", () => {
    expect(selectFacetedInstances(ROWS, FIELDS)).toMatchObject({
      uris: ["ex:a", "ex:b", "ex:c"],
      totalCount: 3,
    });
  });

  it("counts each value and the none bucket over the set", () => {
    const facets = selectFacetedInstances(PAIRED, FIELDS).facets;
    expect(facets.map((facet) => facet.field)).toEqual([
      "line",
      "stepFree",
      "kind",
    ]);
    expect(facets.at(1)?.values.map((value) => value.value)).toEqual([
      "false",
      "true",
      null,
    ]);
    expect(facets.at(0)?.values).toEqual([
      { value: "ex:blue", label: "blue line", count: 2 },
      { value: "ex:red", label: "red line", count: 4 },
      { value: null, label: null, count: 2 },
    ]);
  });

  it("keeps the nodes holding a filtered value, none included", () => {
    expect(
      selectFacetedInstances(ROWS, FIELDS, [
        { field: "line", values: ["ex:blue", null] },
      ]).uris,
    ).toEqual(["ex:a", "ex:c"]);
  });

  it("lifts a facet's own filter and keeps the others in its counts", () => {
    const selection = selectFacetedInstances(PAIRED, FIELDS, [
      { field: "line", values: ["ex:blue"] },
      { field: "kind", values: ["ex:Station"] },
    ]);
    expect(selection.totalCount).toBe(2);
    const [lineFacet, , kindFacet] = selection.facets;
    expect(lineFacet?.values.map((value) => value.count)).toEqual([2, 2, 2]);
    expect(kindFacet?.values).toEqual([
      { value: "ex:Interchange", label: "Interchange", count: 0 },
      { value: "ex:Station", label: "Station", count: 2 },
    ]);
  });

  it("drops a facet that cannot split the set", () => {
    const rows = PAIRED.map((row) => ({
      ...row,
      values: { ...row.values, kind: kind("Line") },
    }));
    expect(
      selectFacetedInstances(rows, FIELDS).facets.map((facet) => facet.field),
    ).toEqual(["line", "stepFree"]);
  });

  it("drops a facet with more buckets than half the set", () => {
    expect(selectFacetedInstances(ROWS, FIELDS).facets).toEqual([]);
  });

  it("counts no embedded value as a choice", () => {
    const point = { text: "DiagramPoint", uri: null };
    const rows = PAIRED.map((row) => ({
      ...row,
      values: {
        ...row.values,
        line: row.uri.startsWith("ex:a") ? [point] : [],
      },
    }));
    expect(
      selectFacetedInstances(rows, FIELDS).facets.map((facet) => facet.field),
    ).toEqual(["stepFree", "kind"]);
  });

  it("sorts by a field's text, numbers by value, the nodes without one last", () => {
    expect(
      selectFacetedInstances(ROWS, FIELDS, [], { field: "platforms" }).uris,
    ).toEqual(["ex:b", "ex:a", "ex:c"]);
    expect(
      selectFacetedInstances(ROWS, FIELDS, [], {
        field: "platforms",
        descending: true,
      }).uris,
    ).toEqual(["ex:a", "ex:b", "ex:c"]);
  });

  it("breaks ties by IRI, the nodes without a value too", () => {
    const rows = [...ROWS, { uri: "ex:0", values: {} }];
    expect(
      selectFacetedInstances(rows, FIELDS, [], { field: "name" }).uris,
    ).toEqual(["ex:a", "ex:b", "ex:0", "ex:c"]);
  });

  it("refuses a filter on a field it cannot facet and a sort it cannot make", () => {
    expect(() =>
      selectFacetedInstances(ROWS, FIELDS, [{ field: "name", values: ["x"] }]),
    ).toThrow('the list has no field "name" to filter by');
    expect(() =>
      selectFacetedInstances(ROWS, FIELDS, [], { field: "kind" }),
    ).toThrow('the list has no field "kind" to sort by');
  });
});
