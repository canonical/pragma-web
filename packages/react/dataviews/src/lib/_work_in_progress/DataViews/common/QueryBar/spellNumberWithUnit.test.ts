import { createSchema, type NumberUnits } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import spellNumberWithUnit from "./spellNumberWithUnit.js";

const MEMORY: NumberUnits = {
  base: "MiB",
  display: [
    { symbol: "MiB", factor: 1 },
    { symbol: "GiB", factor: 1024 },
    { symbol: "TiB", factor: 1024 ** 2 },
  ],
};

const english = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
  useGrouping: false,
});

describe("spellNumberWithUnit", () => {
  it("spells a value in the largest unit it is at least one of", () => {
    expect(spellNumberWithUnit(16384, MEMORY, english)).toBe("16 GiB");
    expect(spellNumberWithUnit(1536, MEMORY, english)).toBe("1.5 GiB");
    expect(spellNumberWithUnit(1023, MEMORY, english)).toBe("1023 MiB");
    expect(spellNumberWithUnit(1024 ** 2, MEMORY, english)).toBe("1 TiB");
  });

  it("spells a value smaller than every unit in the smallest", () => {
    expect(spellNumberWithUnit(0, MEMORY, english)).toBe("0 MiB");
    expect(spellNumberWithUnit(0.5, MEMORY, english)).toBe("0.5 MiB");
  });

  it("sizes a negative value by its magnitude", () => {
    expect(spellNumberWithUnit(-2048, MEMORY, english)).toBe("-2 GiB");
  });

  it("spells through the locale's formatter, never translating the symbol", () => {
    const french = new Intl.NumberFormat("fr", { maximumFractionDigits: 1 });
    expect(spellNumberWithUnit(16896, MEMORY, french)).toBe("16,5 GiB");
  });

  it("spells the number alone without units", () => {
    expect(spellNumberWithUnit(16384, undefined, english)).toBe("16384");
    expect(
      spellNumberWithUnit(16384, { base: "MiB", display: [] }, english),
    ).toBe("16384");
  });

  describe("read back as the field reads typed text", () => {
    const schema = createSchema([
      { field: "memory", kind: "number", units: MEMORY },
    ]);
    const readBack = (text: string): number => {
      const validation = schema.validateInput("memory", text);
      if (validation.status !== "valid") {
        throw new Error(`"${text}" did not read back: ${validation.status}`);
      }
      return Number(validation.operands.at(0));
    };

    it("reads back a format without grouping, and not one with it", () => {
      const grouped = new Intl.NumberFormat("en");
      expect(spellNumberWithUnit(1023, MEMORY, grouped)).toBe("1,023\u00a0MiB");
      expect(schema.validateInput("memory", "1,023\u00a0MiB").status).toBe(
        "invalid",
      );
      expect(readBack(spellNumberWithUnit(1023, MEMORY, english))).toBe(1023);
    });

    it("returns each value within its unit's rounding", () => {
      for (let exponent = 0; exponent <= 24; exponent += 1) {
        for (const mantissa of [1, 1.3, 2.75, 7, 9.99]) {
          const value = Math.round(mantissa * 2 ** exponent);
          const spelled = spellNumberWithUnit(value, MEMORY, english);
          const unit = MEMORY.display.findLast(({ factor }) => value >= factor);
          // Two fraction digits of the unit chosen: half a hundredth of it.
          const tolerance = ((unit?.factor ?? 1) * 0.01) / 2;
          expect(Math.abs(readBack(spelled) - value)).toBeLessThanOrEqual(
            tolerance,
          );
        }
      }
    });
  });
});
