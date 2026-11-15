import { describe, expect, it } from "vitest";
import readApiFacets from "./readApiFacets.js";
import type { ApiQuery, ApiRecord } from "./types.js";

const records: readonly ApiRecord[] = [
  { id: "a", name: "web", status: "running", cores: 4 },
  { id: "b", name: "api", status: "failed", cores: 8 },
  { id: "c", name: "db", status: 42, cores: "many" },
  { id: "d", name: "cache", status: null, cores: 16 },
  { id: "e", name: "spare", status: "zeta" },
];

/** A query restricting nothing, asking for the given facets. */
const QUERY: ApiQuery = {
  text: [],
  statuses: { isAny: [], isNone: [] },
  cores: { gte: null, lte: null },
  search: null,
  facets: ["status", "cores"],
  sort: null,
};

/** A test that holds when a value equals the operand. */
const matchEqual = (_operator: string, text: string) => (value: string) =>
  value === text;

describe("readApiFacets", () => {
  it("counts choice statuses in the endpoint's order, then the rest by code unit", () => {
    expect(readApiFacets(records, QUERY, records, matchEqual)).toEqual({
      status: {
        kind: "values",
        values: [
          { value: "running", count: { kind: "exact", value: 1 } },
          { value: "failed", count: { kind: "exact", value: 1 } },
          { value: 42, count: { kind: "exact", value: 1 } },
          { value: "zeta", count: { kind: "exact", value: 1 } },
        ],
      },
      cores: { kind: "range", min: 4, max: 16 },
    });
  });

  it("lifts the field's own restriction, keeping a negated text match", () => {
    const query: ApiQuery = {
      ...QUERY,
      text: [{ field: "name", operator: "isNot", text: "web" }],
      statuses: { isAny: ["failed"], isNone: [] },
      cores: { gte: 8, lte: null },
    };
    expect(readApiFacets(records, query, [], matchEqual)).toEqual({
      status: {
        kind: "values",
        values: [{ value: "failed", count: { kind: "exact", value: 1 } }],
      },
      cores: { kind: "range", min: 8, max: 8 },
    });
  });

  it("reads no range while no record holds a number of cores", () => {
    expect(
      readApiFacets([], { ...QUERY, facets: ["cores"] }, [], matchEqual),
    ).toEqual({ cores: { kind: "range", min: null, max: null } });
  });

  it("orders the statuses it does not list by their text, each once", () => {
    const unlisted: readonly ApiRecord[] = [
      { id: "z", status: "zeta" },
      { id: "n", status: 42 },
      { id: "t", status: "42" },
      { id: "a", status: "alpha" },
    ];
    const facet = readApiFacets(
      unlisted,
      { ...QUERY, facets: ["status"] },
      unlisted,
      matchEqual,
    )["status"];
    expect(
      facet?.kind === "values" ? facet.values.map(({ value }) => value) : null,
    ).toEqual([42, "42", "alpha", "zeta"]);
  });
});
