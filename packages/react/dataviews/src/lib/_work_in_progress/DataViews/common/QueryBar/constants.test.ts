import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DRAFT_ID,
  NARROW_WIDTH_REM,
  OPERATOR_SYMBOLS,
  UNCOUNTED,
} from "./constants.js";

describe("OPERATOR_SYMBOLS", () => {
  it("gives each operator its typed symbols, widening the strict bounds", () => {
    expect(OPERATOR_SYMBOLS).toEqual({
      isAny: [{ symbol: ":", widened: false }],
      is: [{ symbol: ":", widened: false }],
      isNone: [
        { symbol: "!=", widened: false },
        { symbol: "≠", widened: false },
      ],
      isNot: [
        { symbol: "!=", widened: false },
        { symbol: "≠", widened: false },
      ],
      gte: [
        { symbol: ">=", widened: false },
        { symbol: "≥", widened: false },
        { symbol: ">", widened: true },
      ],
      lte: [
        { symbol: "<=", widened: false },
        { symbol: "≤", widened: false },
        { symbol: "<", widened: true },
      ],
      isSet: [],
      contains: [],
      notContains: [],
      startsWith: [],
      endsWith: [],
    });
    expect(Object.isFrozen(OPERATOR_SYMBOLS)).toBe(true);
  });
});

describe("DRAFT_ID", () => {
  it("names the chip being built apart from every clause id", () => {
    expect(DRAFT_ID).toBe("draft");
  });
});

describe("NARROW_WIDTH_REM", () => {
  it("narrows the bar below 37.5rem, the width the stylesheet queries", () => {
    expect(NARROW_WIDTH_REM).toBe(37.5);
    // Path from the file's own URL: jsdom's global URL is not Node's.
    const stylesheet = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "styles.css"),
      "utf8",
    );
    expect(
      stylesheet.match(
        /@container data-views-query-bar \(width < ([\d.]+)rem\)/,
      )?.[1],
    ).toBe(String(NARROW_WIDTH_REM));
  });
});

describe("UNCOUNTED", () => {
  it("is the count nobody has made, and cannot change", () => {
    expect(UNCOUNTED).toEqual({ kind: "unknown" });
    expect(Object.isFrozen(UNCOUNTED)).toBe(true);
  });
});
