import { describe, expect, it } from "vitest";
import spellOperand from "./spellOperand.js";

const memory = {
  field: "memory",
  kind: "number",
  units: {
    base: "MiB",
    display: [
      { symbol: "MiB", factor: 1 },
      { symbol: "GiB", factor: 1024 },
    ],
  },
} as const;

describe("spellOperand", () => {
  it("spells a number in its largest unit, ungrouped, with the reader's separator", () => {
    expect(spellOperand(memory, 65_536, ".")).toBe("64 GiB");
    expect(spellOperand(memory, 1536, ",")).toBe("1,5 GiB");
    // Every digit it takes to read back as the value held.
    expect(spellOperand(memory, 1500, ".")).toBe("1.46484375\u00a0GiB");
    expect(spellOperand({ field: "cores", kind: "number" }, 12_345, ".")).toBe(
      "12345",
    );
  });

  it("swaps only the number's point, never a dot in the unit symbol", () => {
    const area = {
      field: "area",
      kind: "number",
      units: { base: "sq.m", display: [{ symbol: "sq.m", factor: 1 }] },
    } as const;
    expect(spellOperand(area, 64, ",")).toBe("64\u00a0sq.m");
    expect(spellOperand(area, 1.5, ",")).toBe("1,5\u00a0sq.m");
    expect(spellOperand(area, -1.5, ",")).toBe("-1,5\u00a0sq.m");
  });

  it("spells anything else as its text", () => {
    expect(spellOperand({ field: "status", kind: "choices" }, 4, ".")).toBe(
      "4",
    );
    expect(spellOperand(undefined, "ready", ".")).toBe("ready");
    expect(spellOperand(memory, "ready", ".")).toBe("ready");
  });
});
