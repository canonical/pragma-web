import { describe, expect, it } from "vitest";
import { listAncestorLevels } from "./listAncestorLevels.js";

describe("listAncestorLevels", () => {
  it("lists each ancestor once, at its shortest distance", () => {
    const parents = new Map([
      ["Hub", ["Agent", "Place"]],
      ["Agent", ["Thing"]],
      ["Place", ["Thing", "Agent"]],
    ]);
    expect(listAncestorLevels("Hub", parents)).toEqual([
      ["Agent", "Place"],
      ["Thing"],
    ]);
  });

  it("lists no level for a root or an unknown class", () => {
    expect(listAncestorLevels("Thing", new Map([["Thing", []]]))).toEqual([]);
    expect(listAncestorLevels("Nowhere", new Map())).toEqual([]);
  });

  it("ends the walk on a cycle", () => {
    const parents = new Map([
      ["A", ["B"]],
      ["B", ["C"]],
      ["C", ["A"]],
    ]);
    expect(listAncestorLevels("A", parents)).toEqual([["B"], ["C"]]);
  });
});
