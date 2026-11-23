import { describe, expect, it } from "vitest";
import { readId } from "../../../testing/index.js";
import { createCollection } from "../collection/index.js";
import { EMPTY_SLICE } from "../query/index.js";
import readSlice from "./readSlice.js";

const machines = createCollection({
  identify: readId,
  fields: [
    { field: "status", kind: "choices", options: ["failed", "ready"] },
    { field: "cpu", kind: "number" },
    { field: "updated", kind: "date" },
    { field: "owner", kind: "presence" },
    { field: "name", kind: "text" },
  ],
});

describe("readSlice", () => {
  it("reads each filter by field through its kind", () => {
    const reading = readSlice(machines, {
      ...EMPTY_SLICE,
      filter: [
        { field: "cpu", operator: "lte", operands: [16] },
        { field: "status", operator: "isAny", operands: ["ready", "failed"] },
        { field: "cpu", operator: "gte", operands: [4] },
        { field: "owner", operator: "isSet", operands: [] },
        { field: "updated", operator: "gte", operands: ["2026-01-01"] },
        { field: "name", operator: "contains", operands: ["web"] },
        { field: "name", operator: "startsWith", operands: ["api"] },
        { field: "status", operator: "isNone", operands: ["failed"] },
      ],
      search: "yak",
      sort: [
        { field: "cpu", direction: "desc" },
        { field: "cpu", direction: "asc" },
      ],
    });
    expect(reading).toEqual({
      filters: {
        status: {
          isAny: new Set(["failed", "ready"]),
          isNone: new Set(["failed"]),
        },
        cpu: { gte: 4, lte: 16 },
        owner: true,
        updated: { gte: "2026-01-01" },
        name: { contains: "web", startsWith: "api" },
      },
      search: "yak",
      sort: [{ field: "cpu", direction: "desc" }],
    });
  });

  it("reads the query that restricts nothing as no filters", () => {
    expect(readSlice(machines, EMPTY_SLICE)).toEqual({
      filters: {},
      search: null,
      sort: [],
    });
  });

  it("leaves out a predicate on a field the schema does not define", () => {
    expect(
      readSlice(machines, {
        ...EMPTY_SLICE,
        filter: [{ field: "zone", operator: "isAny", operands: ["eu"] }],
      }).filters,
    ).toEqual({});
  });
});
