import { describe, expect, it } from "vitest";
import readRestQuery from "./readRestQuery.js";

describe("readRestQuery", () => {
  it.each([
    "is",
    "isNot",
    "contains",
    "notContains",
    "startsWith",
    "endsWith",
  ] as const)("reads name__%s as text the name must match", (operator) => {
    expect(
      readRestQuery(new URLSearchParams(`name__${operator}=web`)),
    ).toMatchObject({
      query: { text: [{ field: "name", operator, text: "web" }] },
    });
  });

  it("refuses an operator a text field does not take here", () => {
    expect(readRestQuery(new URLSearchParams("region__is=eu"))).toEqual({
      reason: 'this endpoint does not accept "region__is"',
    });
  });

  it("refuses a facet it cannot compute", () => {
    expect(readRestQuery(new URLSearchParams("facet=name"))).toEqual({
      reason: 'this endpoint computes no facet for "name"',
    });
  });
});
