import { describe, expect, it } from "vitest";
import foldStoredText from "./foldStoredText.js";

describe("foldStoredText", () => {
  it("lowercases without a locale", () => {
    expect(foldStoredText("DISK-İ")).toBe("disk-i̇");
  });

  it("reads a final sigma as sigma", () => {
    expect(foldStoredText("ΟΔΟΣ")).toBe("οδοσ");
    expect(foldStoredText("οδος")).toBe("οδοσ");
  });

  it("composes decomposed text", () => {
    expect(foldStoredText("Café")).toBe("café");
  });
});
