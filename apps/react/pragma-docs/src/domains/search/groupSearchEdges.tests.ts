import { describe, expect, it } from "vitest";
import groupSearchEdges from "./groupSearchEdges.js";

const edge = (id: string, type: string) => ({
  id,
  node: { _meta: { type: { uri: type } } },
});
const facet = (uri: string, count: number, label: string | null = uri) => ({
  count,
  type: { uri, label, _meta: { title: `${uri} title` } },
});

describe("groupSearchEdges", () => {
  it("puts the prominent type first, then the others by ascending count", () => {
    const groups = groupSearchEdges(
      [edge("1", "B"), edge("2", "A"), edge("3", "C"), edge("4", "A")],
      [facet("A", 29), facet("B", 5), facet("C", 3)],
    );
    expect(groups.map(({ type, count }) => [type, count])).toEqual([
      ["A", 29],
      ["C", 3],
      ["B", 5],
    ]);
    expect(groups[0]?.edges.map(({ id }) => id)).toEqual(["2", "4"]);
  });

  it("names a group by its class's label, else its title", () => {
    const [group] = groupSearchEdges([edge("1", "A")], [facet("A", 1, null)]);
    expect(group?.title).toBe("A title");
  });

  it("leaves out a type with no result on the page and keeps one no facet names", () => {
    const groups = groupSearchEdges(
      [edge("1", "X")],
      [facet("A", 4), facet("B", 2)],
    );
    expect(groups).toEqual([
      { type: "X", title: "X", count: 1, edges: [edge("1", "X")] },
    ]);
  });

  it("makes no group when the provider names no type", () => {
    expect(groupSearchEdges([], [])).toEqual([]);
  });
});
