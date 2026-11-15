import { describe, expect, it } from "vitest";
import { describeArcNesting, describePortRelaxation } from "./layOutRegion.js";

describe("describePortRelaxation", () => {
  it("says nothing when a side kept its spacing", () => {
    expect(describePortRelaxation("Node", "right", 3, 0, false)).toEqual([]);
    expect(describePortRelaxation("Node", "right", 3, 1, true)).toEqual([]);
  });

  it("names a side that needed a looser spacing", () => {
    expect(describePortRelaxation("Node", "left", 6, 1, false)).toEqual([
      `G6: Node's left side needs 6 relation ports; relaxed to "hub clearance"`,
    ]);
  });
});

describe("describeArcNesting", () => {
  it("says nothing of an arc inside its channel or in the last column", () => {
    expect(describeArcNesting("a b", 40, 48, true)).toEqual([]);
    expect(describeArcNesting("a b", 64, 48, false)).toEqual([]);
  });

  it("names an arc nested past its channel", () => {
    expect(describeArcNesting("a b", 48, 48, true)).toEqual([
      "G18: arc a b nests to 48px, beyond the 48px channel",
    ]);
  });
});
