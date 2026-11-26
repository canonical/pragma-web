import { describe, expect, it } from "vitest";
import {
  ALTERNATIVE_SET_OPERATOR,
  NO_RECORDS,
  PRESENCE_CHOICES,
  SET_OPERATOR_SWITCH_MESSAGES,
} from "./constants.js";

describe("constants", () => {
  it("counts no records exactly", () => {
    expect(NO_RECORDS).toEqual({ kind: "exact", value: 0 });
  });

  it("freezes the count", () => {
    expect(Object.isFrozen(NO_RECORDS)).toBe(true);
  });

  it("lists the presence choices, any first", () => {
    expect(PRESENCE_CHOICES.map(({ applied }) => applied)).toEqual([
      null,
      true,
      false,
    ]);
  });

  it("pairs each set operator with the other", () => {
    expect(ALTERNATIVE_SET_OPERATOR).toEqual({
      isAny: "isNone",
      isNone: "isAny",
    });
    expect(SET_OPERATOR_SWITCH_MESSAGES).toEqual({
      isAny: "matchAnyInstead",
      isNone: "matchNoneInstead",
    });
  });
});
