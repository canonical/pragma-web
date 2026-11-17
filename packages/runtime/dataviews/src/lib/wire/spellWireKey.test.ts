import { describe, expect, it } from "vitest";
import spellWireKey from "./spellWireKey.js";

describe("spellWireKey", () => {
  it("spells the first conjunct at an address as the grammar always did", () => {
    expect(spellWireKey("status", "isAny")).toBe("status");
    expect(spellWireKey("status", "isNone")).toBe("status__isNone");
    expect(spellWireKey("cpu", "gte", 0)).toBe("cpu__gte");
  });

  it("spells a further conjunct with its ordinal, any-of included", () => {
    expect(spellWireKey("tags", "isAny", 1)).toBe("tags__isAny__1");
    expect(spellWireKey("hostname", "contains", 2)).toBe(
      "hostname__contains__2",
    );
  });
});
