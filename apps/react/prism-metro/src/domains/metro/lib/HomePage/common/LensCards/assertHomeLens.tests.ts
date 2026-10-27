// @vitest-environment node

import { describe, expect, it } from "vitest";
import { HOME_LENS_MESSAGES } from "../../../../constants.js";
import assertHomeLens from "./assertHomeLens.js";

describe("assertHomeLens", () => {
  it.each(Object.keys(HOME_LENS_MESSAGES))(
    "names the lens %s, which the landing has words for",
    (name) => {
      expect(assertHomeLens(name)).toBe(name);
    },
  );

  it("throws for a lens the landing has no words for, naming it", () => {
    expect(() => assertHomeLens("network")).toThrow(/"network"/);
  });

  it("throws for a name only the object prototype holds", () => {
    expect(() => assertHomeLens("toString")).toThrow(/"toString"/);
  });
});
