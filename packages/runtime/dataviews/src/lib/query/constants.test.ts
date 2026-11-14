import { describe, expect, it } from "vitest";
import { DEFAULT_WINDOW, EMPTY_SLICE, OPERATOR_ARITY } from "./constants.js";

describe("constants", () => {
  it("names the operands each operator carries, frozen", () => {
    expect(OPERATOR_ARITY).toEqual({
      isAny: "many",
      isNone: "many",
      gte: "one",
      lte: "one",
      isSet: "none",
      contains: "one",
      startsWith: "one",
    });
    expect(Object.isFrozen(OPERATOR_ARITY)).toBe(true);
  });

  it("starts on the first page of fifty, nothing collapsed, frozen", () => {
    expect(DEFAULT_WINDOW).toEqual({
      page: 1,
      size: 50,
      cursor: null,
      collapsed: [],
    });
    expect(Object.isFrozen(DEFAULT_WINDOW)).toBe(true);
    expect(Object.isFrozen(DEFAULT_WINDOW.collapsed)).toBe(true);
  });

  it("restricts nothing in the empty slice, frozen", () => {
    expect(EMPTY_SLICE).toEqual({
      filter: [],
      search: null,
      sort: [],
      group: [],
    });
    expect(Object.isFrozen(EMPTY_SLICE)).toBe(true);
    expect(Object.isFrozen(EMPTY_SLICE.filter)).toBe(true);
    expect(Object.isFrozen(EMPTY_SLICE.sort)).toBe(true);
    expect(Object.isFrozen(EMPTY_SLICE.group)).toBe(true);
  });
});
