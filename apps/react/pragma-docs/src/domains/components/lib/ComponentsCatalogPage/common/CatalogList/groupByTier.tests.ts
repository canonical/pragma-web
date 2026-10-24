import { describe, expect, it } from "vitest";
import groupByTier from "./groupByTier.js";

const UNTIERED = "Untiered";

/** An edge over a node of a tier. */
const edge = (uri: string, tier: string | null) => ({
  node: { uri, tier: tier === null ? null : { name: tier } },
});

describe("groupByTier", () => {
  it("groups the components by tier, in the catalog's order and the graph's", () => {
    const groups = groupByTier(
      [
        edge("a", "Sites"),
        edge("b", "Global"),
        edge("c", null),
        edge("d", "Global"),
        edge("e", "Apps/LXD"),
      ],
      UNTIERED,
    );
    expect(
      groups.map(({ tier, nodes }) => [tier, nodes.map(({ uri }) => uri)]),
    ).toEqual([
      ["Global", ["b", "d"]],
      ["Apps/LXD", ["e"]],
      ["Sites", ["a"]],
      [UNTIERED, ["c"]],
    ]);
  });

  it("returns no group for no component", () => {
    expect(groupByTier([], UNTIERED)).toEqual([]);
  });
});
