import { describe, expect, it } from "vitest";
import { readId } from "../../../testing/index.js";
import { createCollection } from "../collection/index.js";
import isCarryingQuery from "./isCarryingQuery.js";

const { schema } = createCollection({
  identify: readId,
  fields: [{ field: "status", kind: "choices", options: ["failed"] }],
});

const isCarrying = (search: string, keepsViews = true): boolean =>
  isCarryingQuery({ params: new URLSearchParams(search), schema, keepsViews });

describe("isCarryingQuery", () => {
  it("reads a field, an operator on one, a written key or the open view as a query", () => {
    expect(isCarrying("status=failed")).toBe(true);
    expect(isCarrying("status__isSet=1")).toBe(true);
    expect(isCarrying("page=2")).toBe(true);
    expect(isCarrying("view=v1")).toBe(true);
  });

  it("reads the host's own parameters, and none, as no query", () => {
    expect(isCarrying("")).toBe(false);
    expect(isCarrying("tab=inventory&utm__source=mail&as=table")).toBe(false);
  });

  it("reads a filter on a field the collection does not declare as a query", () => {
    // Spelled with one of the grammar's operators, it is a filter, refused
    // rather than left to the host.
    expect(isCarrying("tab=inventory&gone__isSet=1")).toBe(true);
  });

  it("reads an open view as no query where the provider keeps no views", () => {
    expect(isCarrying("view=v1", false)).toBe(false);
    expect(isCarrying("view=v1&status=failed", false)).toBe(true);
  });
});
