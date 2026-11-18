import { describe, expect, it } from "vitest";
import findNextPart from "./findNextPart.js";

const draft = {
  kind: "predicate",
  origin: null,
  field: "status",
  operator: "isAny",
  operands: ["ready"],
} as const;

describe("findNextPart", () => {
  it("moves forward and back across the parts", () => {
    expect(findNextPart(draft, "field", false)).toBe("operator");
    expect(findNextPart(draft, "operator", false)).toBe("value");
    expect(findNextPart(draft, "value", true)).toBe("operator");
    expect(findNextPart(draft, "operator", true)).toBe("field");
  });

  it("finds none past the last part or before the first", () => {
    expect(findNextPart(draft, "value", false)).toBeNull();
    expect(findNextPart(draft, "field", true)).toBeNull();
    expect(
      findNextPart({ ...draft, operator: "isSet" }, "operator", false),
    ).toBeNull();
  });
});
