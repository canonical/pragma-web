import { describe, expect, it } from "vitest";
import listParts from "./listParts.js";

const draft = {
  kind: "predicate",
  origin: null,
  field: "status",
  operands: [],
} as const;

describe("listParts", () => {
  it("walks field, operator and value, with presence's value in its operator", () => {
    expect(listParts({ ...draft, operator: null })).toEqual([
      "field",
      "operator",
      "value",
    ]);
    expect(listParts({ ...draft, operator: "isSet" })).toEqual([
      "field",
      "operator",
    ]);
  });

  it("gives the search its one part", () => {
    expect(
      listParts({
        kind: "search",
        origin: { id: "search", ref: null },
        text: "ex",
      }),
    ).toEqual(["search"]);
  });
});
