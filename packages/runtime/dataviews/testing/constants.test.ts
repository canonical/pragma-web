import { describe, expect, it } from "vitest";
import { FILE_RULE_ALLOWLIST } from "./constants.js";

describe("constants", () => {
  it("lists each owed finding once, frozen", () => {
    expect(new Set(FILE_RULE_ALLOWLIST).size).toBe(FILE_RULE_ALLOWLIST.length);
    expect(Object.isFrozen(FILE_RULE_ALLOWLIST)).toBe(true);
  });
});
