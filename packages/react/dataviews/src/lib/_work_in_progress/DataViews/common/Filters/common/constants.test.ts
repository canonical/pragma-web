import { describe, expect, it } from "vitest";
import { NO_RECORDS } from "./constants.js";

describe("constants", () => {
  it("counts no records exactly", () => {
    expect(NO_RECORDS).toEqual({ kind: "exact", value: 0 });
  });

  it("freezes the count", () => {
    expect(Object.isFrozen(NO_RECORDS)).toBe(true);
  });
});
