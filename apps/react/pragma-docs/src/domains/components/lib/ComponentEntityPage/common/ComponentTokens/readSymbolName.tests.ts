import { describe, expect, it } from "vitest";
import readSymbolName from "./readSymbolName.js";

describe("readSymbolName", () => {
  it("reads the path after the symbol's namespace", () => {
    expect(readSymbolName("https://dt.canonical.com/color.text")).toBe(
      "color.text",
    );
  });
});
