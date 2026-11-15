import { describe, expect, it } from "vitest";
import groupBindings from "./groupBindings.js";

describe("groupBindings", () => {
  it("groups by part in the graph's order, each part by rank", () => {
    expect(
      groupBindings([
        { node: "$root/icon", consumesSymbol: "dt:b", rank: 2 },
        { node: "$root", consumesSymbol: "dt:c", rank: 1 },
        { node: "$root/icon", consumesSymbol: "dt:a", rank: 1 },
      ]),
    ).toEqual([
      {
        part: "$root/icon",
        rows: [
          { symbol: "dt:a", rank: 1 },
          { symbol: "dt:b", rank: 2 },
        ],
      },
      { part: "$root", rows: [{ symbol: "dt:c", rank: 1 }] },
    ]);
  });

  it("lists a symbol a part binds twice at one rank once", () => {
    expect(
      groupBindings([
        { node: "$root", consumesSymbol: "dt:space", rank: 1 },
        { node: "$root", consumesSymbol: "dt:space", rank: 1 },
        { node: "$root", consumesSymbol: "dt:space", rank: 2 },
      ]),
    ).toEqual([
      {
        part: "$root",
        rows: [
          { symbol: "dt:space", rank: 1 },
          { symbol: "dt:space", rank: 2 },
        ],
      },
    ]);
  });

  it("leaves out a binding with no part, symbol or rank", () => {
    expect(
      groupBindings([
        { node: null, consumesSymbol: "dt:a", rank: 1 },
        { node: "$root", consumesSymbol: undefined, rank: 1 },
        { node: "$root", consumesSymbol: "dt:a", rank: null },
      ]),
    ).toEqual([]);
  });
});
