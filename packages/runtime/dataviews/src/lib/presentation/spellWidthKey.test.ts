import { describe, expect, it } from "vitest";
import spellWidthKey from "./spellWidthKey.js";

describe("spellWidthKey", () => {
  it("spells a column's width key after the width prefix", () => {
    expect(spellWidthKey("name")).toBe("table.width.name");
  });
});
