import { describe, expect, it } from "vitest";
import { createCollection } from "../collection/index.js";
import declareCapabilities from "./declareCapabilities.js";
import listOfferedOperators from "./listOfferedOperators.js";

const collection = createCollection({
  identify: (row: { readonly id: string }) => row.id,
  fields: [
    { field: "name", kind: "text" },
    { field: "owner", kind: "presence" },
  ],
});

const name = { field: "name", kind: "text" } as const;

describe("listOfferedOperators", () => {
  it("lists the declared operators in the kind's order", () => {
    const capabilities = declareCapabilities(collection, {
      filter: { name: ["endsWith", "is", "contains"] },
    });
    expect(listOfferedOperators(name, capabilities)).toEqual([
      "is",
      "contains",
      "endsWith",
    ]);
  });

  it("lists every operator the kind accepts for a field declared whole", () => {
    const capabilities = declareCapabilities(collection, {
      filter: { name: true },
    });
    expect(listOfferedOperators(name, capabilities)).toEqual([
      "is",
      "isNot",
      "contains",
      "notContains",
      "startsWith",
      "endsWith",
    ]);
  });

  it("lists none for a field the source does not declare", () => {
    const capabilities = declareCapabilities(collection, {
      filter: { owner: true },
    });
    expect(listOfferedOperators(name, capabilities)).toEqual([]);
    expect(
      listOfferedOperators(
        { field: "constructor", kind: "text" },
        capabilities,
      ),
    ).toEqual([]);
  });
});
