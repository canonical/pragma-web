import { describe, expect, it } from "vitest";
import readApiFacets from "./readApiFacets.js";
import selectRecords from "./selectRecords.js";
import type { ApiQuery, ApiRecord, ApiTextMatch } from "./types.js";

/** The records every case computes over. */
const RECORDS: readonly ApiRecord[] = [
  { id: "a", name: "alpha", status: "pending", cores: 4 },
  { id: "b", name: "beta", status: "running", cores: 16 },
  { id: "c", name: "gamma", status: "running", cores: 2 },
  { id: "d", name: "delta", status: "retired", cores: "32" },
  { id: "e", name: "epsilon", status: 42, cores: Number.POSITIVE_INFINITY },
  { id: "f", name: "zeta", status: "42", cores: 8 },
  { id: "g", name: "eta", status: "archived" },
  { id: "h", name: "theta", status: null, cores: 1 },
];

/** A query asking for both facets and restricting nothing else. */
const createQuery = (members: Partial<ApiQuery>): ApiQuery => ({
  text: [],
  statuses: { isAny: [], isNone: [] },
  cores: { gte: null, lte: null },
  search: null,
  facets: ["status", "cores"],
  sort: null,
  ...members,
});

/** Whether a value holds text, compared as written. */
const matchPlainText =
  (operator: ApiTextMatch["operator"], text: string) => (value: string) =>
    operator === "contains" ? value.includes(text) : value.startsWith(text);

/** The facets one query answers, over the records it selects itself. */
const readFacets = (members: Partial<ApiQuery>) => {
  const query = createQuery(members);
  return readApiFacets(
    RECORDS,
    query,
    selectRecords(RECORDS, query, matchPlainText),
    matchPlainText,
  );
};

/** One status the values facet lists, counted exactly. */
const countValue = (value: string | number, count: number) => ({
  value,
  count: { kind: "exact", value: count },
});

describe("readApiFacets", () => {
  it("counts each status, listed ones in order, then others by code unit", () => {
    expect(readFacets({ facets: ["status"] })).toEqual({
      status: {
        kind: "values",
        values: [
          countValue("running", 2),
          countValue("pending", 1),
          countValue(42, 1),
          countValue("42", 1),
          countValue("archived", 1),
          countValue("retired", 1),
        ],
      },
    });
  });

  it("bounds the finite numbers of cores", () => {
    expect(readFacets({ facets: ["cores"] })).toEqual({
      cores: { kind: "range", min: 1, max: 16 },
    });
  });

  it("answers only the facets asked for", () => {
    expect(readFacets({ facets: [] })).toEqual({});
  });

  it("lifts the status filter from the status facet, and only from it", () => {
    expect(
      readFacets({ statuses: { isAny: ["running"], isNone: [] } }),
    ).toEqual({
      status: {
        kind: "values",
        values: [
          countValue("running", 2),
          countValue("pending", 1),
          countValue(42, 1),
          countValue("42", 1),
          countValue("archived", 1),
          countValue("retired", 1),
        ],
      },
      cores: { kind: "range", min: 2, max: 16 },
    });
  });

  it("lifts the cores bounds from the cores facet, and only from it", () => {
    expect(readFacets({ cores: { gte: 4, lte: 8 } })).toEqual({
      status: {
        kind: "values",
        values: [countValue("pending", 1), countValue("42", 1)],
      },
      cores: { kind: "range", min: 1, max: 16 },
    });
  });

  it("keeps every other restriction on both facets", () => {
    expect(
      readFacets({
        text: [{ field: "name", operator: "contains", text: "eta" }],
        statuses: { isAny: [], isNone: ["running"] },
        cores: { gte: 5, lte: null },
      }),
    ).toEqual({
      status: {
        kind: "values",
        values: [countValue("running", 1), countValue("42", 1)],
      },
      cores: { kind: "range", min: 8, max: 8 },
    });
  });

  it("reads the matched records when the query restricts neither field", () => {
    const query = createQuery({});
    expect(
      readApiFacets(RECORDS, query, RECORDS.slice(0, 2), matchPlainText),
    ).toEqual({
      status: {
        kind: "values",
        values: [countValue("running", 1), countValue("pending", 1)],
      },
      cores: { kind: "range", min: 4, max: 16 },
    });
  });

  it("answers no bounds while no record holds a number of cores", () => {
    expect(
      readFacets({
        text: [{ field: "name", operator: "startsWith", text: "eta" }],
      }),
    ).toEqual({
      status: { kind: "values", values: [countValue("archived", 1)] },
      cores: { kind: "range", min: null, max: null },
    });
  });

  it("throws on a facet field it has no reader for", () => {
    const query = createQuery({});
    expect(() =>
      readApiFacets(
        RECORDS,
        { ...query, facets: JSON.parse('["name"]') },
        RECORDS,
        matchPlainText,
      ),
    ).toThrow('no facet reader for "name"');
  });
});
