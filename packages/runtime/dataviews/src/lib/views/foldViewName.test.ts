import { describe, expect, it } from "vitest";
import foldViewName from "./foldViewName.js";

describe("foldViewName", () => {
  it("trims and case folds a name", () => {
    expect(foldViewName("  Failed Machines ")).toBe("failed machines");
  });

  it("folds two spellings of one accented name alike", () => {
    expect(foldViewName("Café")).toBe(foldViewName("Café"));
  });

  it("folds a name of only spaces to nothing", () => {
    expect(foldViewName("   ")).toBe("");
  });
});
