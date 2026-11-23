import { describe, expect, it } from "vitest";
import readGraphQLQuery from "./readGraphQLQuery.js";

/** The query variables naming only a page size ask. */
const EMPTY_QUERY = {
  text: [],
  statuses: { isAny: [], isNone: [] },
  cores: { gte: null, lte: null },
  search: null,
  sort: null,
  facets: [],
};

/** The cursor the endpoint hands back for the page after this offset. */
const spellCursor = (offset: number | string): string => btoa(String(offset));

describe("readGraphQLQuery", () => {
  it("reads the first page, unrestricted, when only its size is given", () => {
    expect(readGraphQLQuery({ first: 5 })).toEqual({
      query: EMPTY_QUERY,
      offset: 0,
      first: 5,
    });
  });

  it("reads a variable or member given as null as not given", () => {
    expect(
      readGraphQLQuery({
        first: 5,
        after: null,
        where: { status: null, coresGte: null, nameContains: null },
        orderBy: null,
        facets: null,
      }),
    ).toEqual({ query: EMPTY_QUERY, offset: 0, first: 5 });
  });

  it("reads every variable and member the query declares", () => {
    expect(
      readGraphQLQuery({
        first: 10,
        after: spellCursor(20),
        where: {
          status: ["running", "failed"],
          statusIsNone: "pending",
          coresGte: 2,
          coresLte: 8,
          nameContains: "db",
          nameStartsWith: "",
          regionContains: "eu",
          ownerContains: "ops",
          ownerStartsWith: "o",
          search: "x",
        },
        orderBy: { field: "cores", direction: "DESC" },
        facets: ["status", "cores", "status"],
      }),
    ).toEqual({
      query: {
        text: [
          { field: "name", operator: "contains", text: "db" },
          { field: "region", operator: "contains", text: "eu" },
          { field: "owner", operator: "contains", text: "ops" },
          { field: "owner", operator: "startsWith", text: "o" },
        ],
        statuses: { isAny: ["running", "failed"], isNone: ["pending"] },
        cores: { gte: 2, lte: 8 },
        search: "x",
        sort: { field: "cores", direction: "desc" },
        facets: ["status", "cores"],
      },
      offset: 20,
      first: 10,
    });
  });

  it("reads an empty search as none, and an ascending order in a list", () => {
    expect(
      readGraphQLQuery({
        first: 1,
        where: { search: "" },
        orderBy: [{ field: "name", direction: "ASC" }],
        facets: "cores",
      }),
    ).toEqual({
      query: {
        ...EMPTY_QUERY,
        sort: { field: "name", direction: "asc" },
        facets: ["cores"],
      },
      offset: 0,
      first: 1,
    });
    expect(readGraphQLQuery({ first: 1, orderBy: [] })).toMatchObject({
      query: { sort: null },
    });
  });

  it("refuses a variable or a filter member the query does not declare", () => {
    expect(readGraphQLQuery({ first: 1, last: 1 })).toEqual({
      reason: 'this endpoint does not accept "last"',
    });
    expect(readGraphQLQuery({ first: 1, where: { id: "a" } })).toEqual({
      reason: 'this endpoint does not accept "where.id"',
    });
  });

  it("refuses a page size that is not a positive whole number", () => {
    for (const first of [undefined, "5", 0, 1.5, Number.MAX_VALUE]) {
      expect(readGraphQLQuery({ first })).toEqual({
        reason: '"first" is not a positive whole number',
      });
    }
  });

  it("refuses a cursor the endpoint never handed back", () => {
    for (const after of [
      5,
      "%",
      spellCursor(""),
      spellCursor("1.0"),
      spellCursor(2 ** 60),
    ]) {
      expect(readGraphQLQuery({ first: 1, after })).toEqual({
        reason: "the cursor is not one this endpoint handed back",
      });
    }
  });

  it("refuses a filter input that is not an object", () => {
    expect(readGraphQLQuery({ first: 1, where: ["status"] })).toEqual({
      reason: '["status"] is not a filter input',
    });
  });

  it("refuses a status it does not know", () => {
    expect(
      readGraphQLQuery({ first: 1, where: { statusIsNone: ["retired"] } }),
    ).toEqual({ reason: '"retired" is not a status' });
  });

  it("refuses a bound that is not a number", () => {
    expect(readGraphQLQuery({ first: 1, where: { coresGte: "2" } })).toEqual({
      reason: '"2" is not a number of cores',
    });
    expect(readGraphQLQuery({ first: 1, where: { coresLte: true } })).toEqual({
      reason: "true is not a number of cores",
    });
  });

  it("refuses text that is not a string", () => {
    expect(readGraphQLQuery({ first: 1, where: { ownerContains: 3 } })).toEqual(
      { reason: "3 is not text" },
    );
    expect(readGraphQLQuery({ first: 1, where: { search: ["a"] } })).toEqual({
      reason: '["a"] is not text',
    });
  });

  it("refuses a facet it does not compute", () => {
    expect(readGraphQLQuery({ first: 1, facets: ["name"] })).toEqual({
      reason: 'this endpoint computes no facet for "name"',
    });
    expect(readGraphQLQuery({ first: 1, facets: [1] })).toEqual({
      reason: "this endpoint computes no facet for 1",
    });
  });

  it("refuses an ordering it cannot run", () => {
    expect(
      readGraphQLQuery({
        first: 1,
        orderBy: [
          { field: "name", direction: "ASC" },
          { field: "cores", direction: "ASC" },
        ],
      }),
    ).toEqual({ reason: "this endpoint orders by one term at a time" });
    expect(readGraphQLQuery({ first: 1, orderBy: "name" })).toEqual({
      reason: '"name" is not an ordering',
    });
    expect(
      readGraphQLQuery({ first: 1, orderBy: { direction: "ASC" } }),
    ).toEqual({ reason: "an ordering names no field" });
    expect(
      readGraphQLQuery({
        first: 1,
        orderBy: { field: "id", direction: "ASC" },
      }),
    ).toEqual({ reason: '"id" is not a field this endpoint orders by' });
    expect(readGraphQLQuery({ first: 1, orderBy: { field: 1 } })).toEqual({
      reason: "1 is not a field this endpoint orders by",
    });
    expect(readGraphQLQuery({ first: 1, orderBy: { field: "name" } })).toEqual({
      reason: "an ordering names no direction",
    });
    expect(
      readGraphQLQuery({
        first: 1,
        orderBy: { field: "name", direction: "asc" },
      }),
    ).toEqual({ reason: '"asc" is not a direction' });
  });
});
