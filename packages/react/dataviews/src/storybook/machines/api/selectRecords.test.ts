import { describe, expect, it } from "vitest";
import selectRecords from "./selectRecords.js";
import type { ApiQuery, ApiRecord, ApiTextMatch } from "./types.js";

const records: readonly ApiRecord[] = [
  { id: "web", name: "web-01" },
  { id: "api", name: "api-01" },
  { id: "number", name: 42 },
  { id: "absent" },
];

/** A query restricting nothing but one text match. */
const queryText = (match: ApiTextMatch): ApiQuery => ({
  text: [match],
  statuses: { isAny: [], isNone: [] },
  cores: { gte: null, lte: null },
  search: null,
  facets: [],
  sort: null,
});

/** The ids one text match selects, by an exact, unfolded test. */
const selectIds = (operator: ApiTextMatch["operator"], text: string) =>
  selectRecords(
    records,
    queryText({ field: "name", operator, text }),
    (held, operand) => (value) =>
      held === "is" ? value === operand : value.includes(operand),
  ).map(({ id }) => id);

describe("selectRecords", () => {
  it("hands a held operator to the endpoint's own test, over text alone", () => {
    expect(selectIds("is", "web-01")).toEqual(["web"]);
    expect(selectIds("contains", "01")).toEqual(["web", "api"]);
  });

  it("selects with a negation exactly the records its operator does not", () => {
    expect(selectIds("isNot", "web-01")).toEqual(["api", "number", "absent"]);
    expect(selectIds("notContains", "web")).toEqual([
      "api",
      "number",
      "absent",
    ]);
  });
});
