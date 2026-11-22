import { describe, expect, it } from "vitest";
import { buildSearchPattern } from "./buildSearchPattern.js";

describe("buildSearchPattern", () => {
  it("finds the text in any case", () => {
    expect("Line on LINE".match(buildSearchPattern("line"))).toEqual([
      "Line",
      "LINE",
    ]);
  });

  it("takes the text's syntax characters literally", () => {
    expect("a.b axb (c)".match(buildSearchPattern("a.b"))).toEqual(["a.b"]);
    expect("a.b axb (c)".match(buildSearchPattern("(c)"))).toEqual(["(c)"]);
  });
});
