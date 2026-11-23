import { describe, expect, it } from "vitest";
import readRestQuery from "./readRestQuery.js";

/** What the endpoint reads from one query string. */
const readSearch = (search: string) =>
  readRestQuery(new URLSearchParams(search));

/** The query a request naming nothing asks. */
const EMPTY_QUERY = {
  text: [],
  statuses: { isAny: [], isNone: [] },
  cores: { gte: null, lte: null },
  search: null,
  sort: null,
  facets: [],
};

describe("readRestQuery", () => {
  it("answers the first page of fifty, unrestricted, when nothing is named", () => {
    expect(readSearch("")).toEqual({ query: EMPTY_QUERY, page: 1, size: 50 });
  });

  it("reads every parameter the endpoint accepts", () => {
    expect(
      readSearch(
        "status=running&status=failed&status__isAny=pending&status__isNone=failed" +
          "&cores__gte=2&cores__lte=8.5&name__contains=db&region__startsWith=eu" +
          "&q=ops&sort=cores__desc&page=3&size=10&facet=status&facet=cores&facet=status",
      ),
    ).toEqual({
      query: {
        text: [
          { field: "name", operator: "contains", text: "db" },
          { field: "region", operator: "startsWith", text: "eu" },
        ],
        statuses: {
          isAny: ["running", "failed", "pending"],
          isNone: ["failed"],
        },
        cores: { gte: 2, lte: 8.5 },
        search: "ops",
        sort: { field: "cores", direction: "desc" },
        facets: ["status", "cores"],
      },
      page: 3,
      size: 10,
    });
  });

  it("reads a negative bound on cores", () => {
    expect(readSearch("cores__gte=-1")).toMatchObject({
      query: { cores: { gte: -1, lte: null } },
    });
  });

  it("drops a blank value, as a control left empty", () => {
    expect(
      readSearch("q=&sort=&page=&status=&name__contains=&facet=&unknown="),
    ).toEqual({ query: EMPTY_QUERY, page: 1, size: 50 });
    expect(readSearch("q=&q=ops")).toMatchObject({ query: { search: "ops" } });
  });

  it("refuses a facet it does not compute", () => {
    expect(readSearch("facet=name")).toEqual({
      reason: 'this endpoint computes no facet for "name"',
    });
  });

  it("refuses a status it does not know", () => {
    expect(readSearch("status__isNone=retired")).toEqual({
      reason: '"retired" is not a status',
    });
  });

  it("refuses a second value, or a second ordered term", () => {
    expect(readSearch("q=a&q=b")).toEqual({ reason: '"q" takes one value' });
    expect(readSearch("sort=name__asc&sort=cores__desc")).toEqual({
      reason: "this endpoint orders by one term at a time",
    });
  });

  it("refuses a malformed sort", () => {
    expect(readSearch("sort=name__asc__x")).toEqual({
      reason: '"sort" takes one field and one direction',
    });
    expect(readSearch("sort=__asc")).toEqual({
      reason: "a sort names no field",
    });
    expect(readSearch("sort=id__asc")).toEqual({
      reason: '"id" is not a field this endpoint orders by',
    });
    expect(readSearch("sort=name")).toEqual({
      reason: "a sort names no direction",
    });
    expect(readSearch("sort=name__up")).toEqual({
      reason: '"up" is not a direction',
    });
  });

  it("orders ascending when asked", () => {
    expect(readSearch("sort=name__asc")).toMatchObject({
      query: { sort: { field: "name", direction: "asc" } },
    });
  });

  it("refuses a page or a size that is not a positive whole number", () => {
    expect(readSearch("page=0")).toEqual({
      reason: '"page" is not a positive whole number',
    });
    expect(readSearch("size=1.5")).toEqual({
      reason: '"size" is not a positive whole number',
    });
  });

  it("refuses a bound on cores that is not a number", () => {
    expect(readSearch("cores__lte=1e3")).toEqual({
      reason: '"1e3" is not a number of cores',
    });
  });

  it("refuses a key it does not accept", () => {
    for (const key of [
      "owner__contains",
      "name__endsWith",
      "name__contains__x",
      "cores__gt",
      "cores",
      "name",
      "toString__contains",
      "constructor",
    ]) {
      expect(readSearch(`${key}=x`)).toEqual({
        reason: `this endpoint does not accept "${key}"`,
      });
    }
  });
});
