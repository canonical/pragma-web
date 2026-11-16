import { describe, expect, it } from "vitest";
import findMissingPart from "./findMissingPart.js";

const draft = { kind: "predicate", origin: null, field: "status" } as const;

describe("findMissingPart", () => {
  it("finds the operator, then a value, then nothing", () => {
    expect(findMissingPart({ ...draft, operator: null, operands: [] })).toBe(
      "operator",
    );
    expect(findMissingPart({ ...draft, operator: "isAny", operands: [] })).toBe(
      "value",
    );
    expect(
      findMissingPart({ ...draft, operator: "isSet", operands: [true] }),
    ).toBeNull();
    expect(
      findMissingPart({
        kind: "search",
        origin: { id: "search", ref: null },
        text: "",
      }),
    ).toBeNull();
  });
});
