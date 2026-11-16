import { describe, expect, it } from "vitest";
import parseNumberWithUnit from "./parseNumberWithUnit.js";
import type { NumberUnits } from "./types.js";

const memory: NumberUnits = {
  base: "MiB",
  display: [
    { symbol: "MiB", factor: 1 },
    { symbol: "GiB", factor: 1024 },
  ],
};

/** The number a reading holds, or what it is instead. */
const read = (input: string, units: NumberUnits | undefined) => {
  const reading = parseNumberWithUnit(input, units);
  return reading.kind === "value" ? reading.value : reading;
};

describe("parseNumberWithUnit", () => {
  it("reads a plain decimal in base units", () => {
    expect(read("16", memory)).toBe(16);
    expect(read("-2.5", undefined)).toBe(-2.5);
  });

  it("multiplies by a display unit, matched case-insensitively", () => {
    expect(read("16 GiB", memory)).toBe(16_384);
    expect(read("1.5gib", memory)).toBe(1536);
    expect(read(" 512 mib ", memory)).toBe(512);
  });

  it("scales a decimal exactly, as typed", () => {
    const bytes: NumberUnits = {
      base: "B",
      display: [
        { symbol: "B", factor: 1 },
        { symbol: "kB", factor: 1000 },
      ],
    };
    expect(read("4.03 kB", bytes)).toBe(4030);
    expect(read("2.01 kB", bytes)).toBe(2010);
    expect(read("-0.5 kB", bytes)).toBe(-500);
    expect(read("0.1", bytes)).toBe(0.1);
  });

  it("scales by a factor below one exactly, and by one with an exponent as it is", () => {
    const tenths: NumberUnits = {
      base: "B",
      display: [
        { symbol: "nB", factor: 1e-9 },
        { symbol: "dB", factor: 0.1 },
        { symbol: "B", factor: 1 },
      ],
    };
    expect(read("3 dB", tenths)).toBe(0.3);
    expect(read("4.03 dB", tenths)).toBe(0.403);
    expect(read("2 nB", tenths)).toBe(2e-9);
  });

  it("reads text on its way to a value as incomplete where the field has units", () => {
    for (const typing of ["16 ", "16 G", "16 gi", "-", "1."]) {
      expect(read(typing, memory)).toEqual({ kind: "incomplete" });
    }
  });

  it("reads a whole symbol the field does not have as an unknown unit", () => {
    expect(read("16 kB", memory)).toEqual({
      kind: "unknown-unit",
      symbol: "kB",
      accepted: ["MiB", "GiB"],
    });
  });

  it("reads no number from other text, nor a unit where the field has none", () => {
    expect(read("GiB", memory)).toEqual({ kind: "not-a-number" });
    expect(read("16 G iB", memory)).toEqual({ kind: "not-a-number" });
    expect(read("1e3", undefined)).toEqual({ kind: "not-a-number" });
    // With units, what follows the digits is read as a symbol.
    expect(read("1e3", memory)).toEqual({
      kind: "unknown-unit",
      symbol: "e3",
      accepted: ["MiB", "GiB"],
    });
    // What could continue the number is no symbol.
    expect(read("1.5.2", memory)).toEqual({ kind: "not-a-number" });
    expect(read("16-", memory)).toEqual({ kind: "not-a-number" });
    expect(read("16 GiB", undefined)).toEqual({ kind: "not-a-number" });
    expect(read("16 ", undefined)).toEqual({ kind: "not-a-number" });
    expect(read("-", undefined)).toEqual({ kind: "not-a-number" });
  });

  it("reads the reader's decimal separator as the point, beside the point itself", () => {
    expect(parseNumberWithUnit("16,5 GiB", memory, ",")).toEqual({
      kind: "value",
      value: 16_896,
    });
    expect(parseNumberWithUnit("16.5 GiB", memory, ",")).toEqual({
      kind: "value",
      value: 16_896,
    });
    expect(parseNumberWithUnit("16,", memory, ",")).toEqual({
      kind: "incomplete",
    });
    // A grouping separator is never read, under either point.
    expect(parseNumberWithUnit("1,024", undefined)).toEqual({
      kind: "not-a-number",
    });
    expect(parseNumberWithUnit("1 024,5", memory, ",")).toEqual({
      kind: "not-a-number",
    });
  });
});
