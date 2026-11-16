import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import spellOperator from "./spellOperator.js";

const ENGLISH = resolveMessages();

describe("spellOperator", () => {
  it("shows a symbol and speaks its words, by the operands", () => {
    expect(spellOperator("gte", [4], ENGLISH)).toEqual({
      shown: "≥",
      spoken: "at least",
    });
    expect(spellOperator("isAny", ["a", "b"], ENGLISH)).toEqual({
      shown: ":",
      spoken: "is any of",
    });
  });

  it("reads the record it is handed and no other", () => {
    expect(
      spellOperator("isSet", [false], {
        operatorShown: (operator, operands) => `${operator}:${operands}`,
        operatorSpoken: () => "spoken",
      }),
    ).toEqual({ shown: "isSet:false", spoken: "spoken" });
  });
});
