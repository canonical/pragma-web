import { describe, expect, it } from "vitest";
import spellTargetKey from "./spellTargetKey.js";

describe("spellTargetKey", () => {
  it("spells the default arrangement as default", () => {
    expect(spellTargetKey("default")).toBe("default");
  });

  it("spells a view by its id", () => {
    expect(spellTargetKey({ view: "v1" })).toBe("view:v1");
  });

  it("keeps a view named default apart from the default arrangement", () => {
    expect(spellTargetKey({ view: "default" })).toBe("view:default");
  });
});
