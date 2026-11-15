import { describe, expect, it } from "vitest";
import readGraphQLQuery from "./readGraphQLQuery.js";

describe("readGraphQLQuery", () => {
  it.each([
    ["nameIs", "is"],
    ["nameIsNot", "isNot"],
    ["nameContains", "contains"],
    ["nameNotContains", "notContains"],
    ["nameStartsWith", "startsWith"],
    ["nameEndsWith", "endsWith"],
  ] as const)(
    "reads where.%s as text the name must match",
    (member, operator) => {
      expect(
        readGraphQLQuery({ first: 5, where: { [member]: "web" } }),
      ).toMatchObject({
        query: { text: [{ field: "name", operator, text: "web" }] },
      });
    },
  );

  it("refuses a text member it does not declare", () => {
    expect(readGraphQLQuery({ first: 5, where: { regionIs: "eu" } })).toEqual({
      reason: 'this endpoint does not accept "where.regionIs"',
    });
  });

  it("refuses a cursor it never handed back, and a facet it cannot compute", () => {
    expect(readGraphQLQuery({ first: 5, after: "%%" })).toEqual({
      reason: "the cursor is not one this endpoint handed back",
    });
    expect(readGraphQLQuery({ first: 5, facets: ["name"] })).toEqual({
      reason: 'this endpoint computes no facet for "name"',
    });
  });

  it("reads an ascending ordering", () => {
    expect(
      readGraphQLQuery({
        first: 5,
        orderBy: { field: "name", direction: "ASC" },
      }),
    ).toMatchObject({ query: { sort: { field: "name", direction: "asc" } } });
  });
});
