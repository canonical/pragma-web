import { describe, expect, it } from "vitest";
import groupResultsByType from "./groupResultsByType.js";

/** A result of `typename`, its type titled `title`, named `name`. */
const result = (typename: string, title: string, name: string) => ({
  __typename: typename,
  name,
  _meta: { type: { _meta: { title } } },
});

const LAYOUT_SWITCHER = result("Component", "Component", "Layout switcher");
const LAYOUT = result("OntologyClass", "Class", "Layout");
const PLAYER_LAYOUT = result("Component", "UI block", "Player layout");
const LAYTON = result("Station", "Station", "Layton");

describe("groupResultsByType", () => {
  it("orders the groups by each type's first appearance in the ranking", () => {
    const groups = groupResultsByType([
      LAYOUT_SWITCHER,
      LAYOUT,
      PLAYER_LAYOUT,
      LAYTON,
    ]);
    expect(groups.map(({ typename }) => typename)).toEqual([
      "Component",
      "OntologyClass",
      "Station",
    ]);
  });

  it("keeps the rank order within a group", () => {
    const groups = groupResultsByType([LAYOUT_SWITCHER, LAYOUT, PLAYER_LAYOUT]);
    expect(groups.at(0)?.results.map(({ node }) => node.name)).toEqual([
      "Layout switcher",
      "Player layout",
    ]);
  });

  it("indexes each result over the grouped order, across the groups", () => {
    const groups = groupResultsByType([
      LAYOUT_SWITCHER,
      LAYOUT,
      PLAYER_LAYOUT,
      LAYTON,
    ]);
    expect(
      groups.flatMap(({ results }) =>
        results.map(({ node, index }) => [index, node.name]),
      ),
    ).toEqual([
      [0, "Layout switcher"],
      [1, "Player layout"],
      [2, "Layout"],
      [3, "Layton"],
    ]);
  });

  it("titles a group with its first member's type title", () => {
    const groups = groupResultsByType([LAYOUT_SWITCHER, PLAYER_LAYOUT]);
    expect(groups.at(0)?.title).toBe("Component");
  });

  it("returns no group for no results", () => {
    expect(groupResultsByType([])).toEqual([]);
  });
});
