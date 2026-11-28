import { describe, expect, it } from "vitest";
import { storyWorkloads, workloadCollection } from "./fixtures.js";

describe("fixtures", () => {
  describe("storyWorkloads", () => {
    it("holds instances of distinct identity, both types among them", () => {
      expect(
        new Set(storyWorkloads.map(workloadCollection.identify)).size,
      ).toBe(storyWorkloads.length);
      expect(new Set(storyWorkloads.map(({ type }) => type))).toEqual(
        new Set(["container", "vm"]),
      );
    });
  });

  describe("workloadCollection", () => {
    it("is discriminated by type", () => {
      expect(workloadCollection.types).toEqual({
        field: "type",
        names: ["container", "vm"],
      });
    });
  });
});
