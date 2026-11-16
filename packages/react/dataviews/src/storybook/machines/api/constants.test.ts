import { describe, expect, it } from "vitest";
import { machineCollection } from "../fixtures.js";
import {
  API_COLLECTION,
  API_SCENARIOS,
  FACET_FIELDS,
  MACHINES_QUERY_TEXT,
  MACHINES_QUERY_VARIABLES,
  SEARCHED_FIELDS,
  SORTED_FIELDS,
  STATUSES,
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

  it("identifies a record by its id over the machine fields", () => {
    expect(API_COLLECTION.identify({ id: "m-01" })).toBe("m-01");
    expect(API_COLLECTION.schema.fields).toEqual(
      machineCollection.schema.fields,
    );
  });

  it("searches the name and the owner", () => {
    expect(SEARCHED_FIELDS).toEqual(["name", "owner"]);
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

  it("accepts the collection's statuses: running, failed and pending", () => {
    expect(STATUSES).toEqual(["running", "failed", "pending"]);
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
