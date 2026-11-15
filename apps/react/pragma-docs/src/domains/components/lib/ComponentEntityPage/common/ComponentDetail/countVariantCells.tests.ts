import { describe, expect, it } from "vitest";
import countVariantCells from "./countVariantCells.js";

/** A family edge at `uri` with `size` modifiers. */
const family = (uri: string, size: number) => ({
  node: { uri, modifiers: { edges: Array.from({ length: size }, () => ({})) } },
});

describe("countVariantCells", () => {
  it("counts the modifiers of the families the example honours", () => {
    expect(
      countVariantCells("button", [
        family("https://ds.canonical.com/global.modifier_family.importance", 3),
        family(
          "https://ds.canonical.com/global.modifier_family.anticipation",
          3,
        ),
        family(
          "https://ds.canonical.com/global.modifier_family.criticality",
          4,
        ),
      ]),
    ).toBe(6);
  });

  it("counts none for an example that honours no family", () => {
    expect(
      countVariantCells("keyboardKey", [
        family("https://ds.canonical.com/global.modifier_family.importance", 3),
      ]),
    ).toBe(0);
  });
});
