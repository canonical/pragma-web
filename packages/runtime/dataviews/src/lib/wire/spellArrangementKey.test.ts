import { describe, expect, it } from "vitest";
import spellArrangementKey from "./spellArrangementKey.js";

describe("spellArrangementKey", () => {
  it("spells a table's order or hidden parameter by its spelled id", () => {
    expect(spellArrangementKey("a.b", "order")).toBe("table.a%2Eb.order");
    expect(spellArrangementKey("t", "hidden")).toBe("table.t.hidden");
    expect(spellArrangementKey("m-1_a", "width")).toBe("table.m-1_a.width");
    expect(spellArrangementKey(":r1:", "order")).toBe("table.%3Ar1%3A.order");
  });
});
