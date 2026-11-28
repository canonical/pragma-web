import { describe, expect, it } from "vitest";
import spellWidthKey from "./spellWidthKey.js";

describe("spellWidthKey", () => {
  it("spells a column's width key under its table's id", () => {
    expect(spellWidthKey("t", "name")).toBe("table.t.width.name");
  });
});
