import { describe, expect, it } from "vitest";
import { UNKNOWN_COUNT } from "./constants.js";

describe("constants", () => {
  it("claims no count in the unknown count, frozen", () => {
    expect(UNKNOWN_COUNT).toEqual({ kind: "unknown" });
    expect(Object.isFrozen(UNKNOWN_COUNT)).toBe(true);
  });
});
