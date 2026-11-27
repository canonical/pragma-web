import { describe, expect, it } from "vitest";
import spellTableId from "./spellTableId.js";

describe("spellTableId", () => {
  it("encodes an id so it holds no dot", () => {
    expect(spellTableId("machines")).toBe("machines");
    expect(spellTableId("a.b c")).toBe("a%2Eb%20c");
  });

  it("encodes an id a part is named for, so no old key reads as a table's", () => {
    expect(spellTableId("width")).toBe("%77idth");
    expect(spellTableId("order")).toBe("%6Frder");
    expect(spellTableId("hidden")).toBe("%68idden");
  });
});
