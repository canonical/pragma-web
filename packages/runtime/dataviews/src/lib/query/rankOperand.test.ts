import { describe, expect, it } from "vitest";
import rankOperand from "./rankOperand.js";

describe("rankOperand", () => {
  it("ranks an operand by its type, then its value", () => {
    expect(rankOperand("a")).toBe("string:a");
    expect(rankOperand(4)).toBe("number:4");
    expect(rankOperand(true)).toBe("boolean:true");
    expect(rankOperand(null)).toBe("object:null");
  });

  it("keeps a string apart from the number it spells", () => {
    expect(rankOperand("0")).not.toBe(rankOperand(0));
  });
});
