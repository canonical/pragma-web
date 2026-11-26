import { describe, expect, it } from "vitest";
import { DEFAULT_UNITY } from "./constants.js";

describe("QueryChip constants", () => {
  it("separates the parts by default", () => {
    expect(DEFAULT_UNITY).toBe("separated");
  });
});
