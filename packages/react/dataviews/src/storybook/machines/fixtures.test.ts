import { describe, expect, it } from "vitest";
import { machineCollection, storyMachines } from "./fixtures.js";

describe("fixtures", () => {
  describe("storyMachines", () => {
    it("holds twelve machines of distinct identity, every status among them", () => {
      expect(storyMachines).toHaveLength(12);
      expect(new Set(storyMachines.map(machineCollection.identify)).size).toBe(
        12,
      );
      expect(new Set(storyMachines.map(({ status }) => status))).toEqual(
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
});
