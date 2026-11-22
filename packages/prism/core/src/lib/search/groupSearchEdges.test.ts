import { describe, expect, it } from "vitest";
import groupSearchEdges, { orderSearchFacets } from "./groupSearchEdges.js";

const edge = (id: string, type: string) => ({
  id,
  node: { _meta: { type: { uri: type } } },
});
const facet = (uri: string, count: number, label: string | null = uri) => ({
  count,
  type: { uri, label, _meta: { title: `${uri} title` } },
});

describe("groupSearchEdges", () => {
  it("puts the site's prominent type first, then the others by ascending count", () => {
    const groups = groupSearchEdges(
      [edge("1", "B"), edge("2", "A"), edge("3", "C"), edge("4", "A")],
      [facet("A", 29), facet("B", 5), facet("C", 3)],
      { prominent: "B" },
    );
    expect(groups.map(({ type, count }) => [type, count])).toEqual([
      ["B", 5],
      ["C", 3],
      ["A", 29],
    ]);
    expect(groups.at(-1)?.edges.map(({ id }) => id)).toEqual(["2", "4"]);
  });

  it("orders by ascending count when the prominent type has no result", () => {
    const groups = groupSearchEdges(
      [edge("1", "A"), edge("2", "C")],
      [facet("A", 29), facet("C", 3)],
      { prominent: "B" },
    );
    expect(groups.map(({ type }) => type)).toEqual(["C", "A"]);
  });

  it("marks a group whose type had results on an earlier page", () => {
    const groups = groupSearchEdges(
      [edge("1", "A"), edge("2", "C")],
      [facet("A", 29), facet("C", 3)],
      { earlier: new Set(["A"]) },
    );
    expect(groups.map(({ type, continued }) => [type, continued])).toEqual([
      ["C", false],
      ["A", true],
    ]);
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
      {
        type: "X",
        title: "X",
        count: 1,
        continued: false,
        edges: [edge("1", "X")],
      },
    ]);
  });

  it("makes no group when the provider names no type", () => {
    expect(groupSearchEdges([], [])).toEqual([]);
  });
});

describe("orderSearchFacets", () => {
  it("gives the facet the groups' order", () => {
    expect(
      orderSearchFacets(
        [facet("A", 29), facet("B", 5), facet("C", 3)],
        "B",
      ).map(({ type }) => type.uri),
    ).toEqual(["B", "C", "A"]);
  });
});
