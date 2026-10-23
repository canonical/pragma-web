import { describe, expect, it } from "vitest";
import groupByClass from "./groupByClass.js";

/** A node of the class `classUri`, titled `classTitle`. */
const buildNode = (uri: string, classUri: string, classTitle: string) => ({
  uri,
  _meta: { type: { uri: classUri, _meta: { title: classTitle } } },
});

const RULE = "cs:Rule";
const STYLE = "cs:StyleRule";

describe("groupByClass", () => {
  it("groups the nodes by their own class, keeping their order", () => {
    const groups = groupByClass([
      buildNode("a", RULE, "Rule"),
      buildNode("b", STYLE, "Style rule"),
      buildNode("c", RULE, "Rule"),
    ]);

    expect(groups.map(({ classUri }) => classUri)).toEqual([RULE, STYLE]);
    expect(groups.at(0)?.nodes.map(({ uri }) => uri)).toEqual(["a", "c"]);
    expect(groups.at(0)?.title).toBe("Rule");
  });

  it("orders the groups by title, not by the order they came in", () => {
    const groups = groupByClass([
      buildNode("a", STYLE, "Style rule"),
      buildNode("b", RULE, "code standard"),
    ]);

    // Collation, not code points: "code standard" sorts before "Style rule"
    // although "S" is below "c" in code-point order.
    expect(groups.map(({ title }) => title)).toEqual([
      "code standard",
      "Style rule",
    ]);
  });

  it("returns no group for no nodes", () => {
    expect(groupByClass([])).toEqual([]);
  });
});
