import { describe, expect, it } from "vitest";
import {
  API_SCENARIOS,
  FACET_FIELDS,
  MACHINES_QUERY_TEXT,
  MACHINES_QUERY_VARIABLES,
  SORTED_FIELDS,
  STATUS_ORDER,
} from "./constants.js";

describe("constants", () => {
  it("serves the live, unanswered, down and first-page-only scenarios", () => {
    expect(API_SCENARIOS).toEqual([
      "live",
      "unanswered",
      "down",
      "first-page-only",
    ]);
  });

  it("orders by every record field and computes facets for two of them", () => {
    expect(SORTED_FIELDS).toEqual([
      "name",
      "status",
      "cores",
      "region",
      "owner",
    ]);
    expect(FACET_FIELDS.every((field) => SORTED_FIELDS.includes(field))).toBe(
      true,
    );
  });

  it("lists the statuses running, failed, then pending", () => {
    expect(STATUS_ORDER).toEqual(["running", "failed", "pending"]);
  });

  it("declares in the query text exactly the variables it lists", () => {
    const declared = [...MACHINES_QUERY_TEXT.matchAll(/\$(\w+):/g)].map(
      (match) => match.at(1),
    );
    expect(declared).toEqual(MACHINES_QUERY_VARIABLES);
  });

  it("names the query MachinesQuery and asks for every record field", () => {
    expect(MACHINES_QUERY_TEXT.startsWith("query MachinesQuery(")).toBe(true);
    for (const field of ["id", ...SORTED_FIELDS]) {
      expect(MACHINES_QUERY_TEXT).toMatch(new RegExp(`^ {8}${field}$`, "m"));
    }
  });
});
