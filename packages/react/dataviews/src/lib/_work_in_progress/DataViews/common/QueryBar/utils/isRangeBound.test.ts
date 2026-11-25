import { describe, expect, it } from "vitest";
import isRangeBound from "./isRangeBound.js";

const held = { field: "cores", operator: "gte", operands: [2] } as const;
const ref = { field: "cores", operator: "gte", nth: 0 } as const;

describe("isRangeBound", () => {
  it("tells a range's bound from a clause of its own, a draft and the search", () => {
    const base = { kind: "predicate", ...held } as const;
    expect(
      isRangeBound({ ...base, origin: { id: "cores__range", ref, held } }),
    ).toBe(true);
    expect(
      isRangeBound({ ...base, origin: { id: "cores__gte__0", ref, held } }),
    ).toBe(false);
    expect(isRangeBound({ ...base, origin: null })).toBe(false);
    expect(
      isRangeBound({
        kind: "search",
        origin: { id: "search", ref: null },
        text: "web",
      }),
    ).toBe(false);
  });
});
