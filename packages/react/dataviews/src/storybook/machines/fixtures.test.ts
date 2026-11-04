import { describe, expect, it } from "vitest";
import { machineCollection, machines } from "./fixtures.js";

describe("machines", () => {
  it("holds twelve machines of distinct identity, every status among them", () => {
    expect(machines).toHaveLength(12);
    expect(new Set(machines.map(machineCollection.identify)).size).toBe(12);
    expect(new Set(machines.map(({ status }) => status))).toEqual(
      new Set(["running", "failed", "pending"]),
    );
  });
});

describe("machineCollection", () => {
  it("declares every field a story filters, searches or sorts by", () => {
    expect(machineCollection.schema.fieldNames).toEqual([
      "status",
      "cores",
      "name",
      "region",
      "owner",
    ]);
  });
});
