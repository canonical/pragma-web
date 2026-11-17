import { describe, expect, it } from "vitest";
import spellOperand from "./spellOperand.js";

describe("spellOperand", () => {
  it("spells a number in the plain decimal the input grammar reads", () => {
    expect(spellOperand(4)).toBe("4");
    expect(spellOperand(1e21)).toBe("1000000000000000000000");
    expect(spellOperand(-1.25e22)).toBe("-12500000000000000000000");
    expect(spellOperand(1.5e-7)).toBe("0.00000015");
    expect(spellOperand(-1.5e-7)).toBe("-0.00000015");
  });

  it("spells any other operand as its own text", () => {
    expect(spellOperand("ex-gpu")).toBe("ex-gpu");
  });
});
