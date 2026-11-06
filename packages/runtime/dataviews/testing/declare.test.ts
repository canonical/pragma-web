import { describe, expect, it } from "vitest";
import declare from "./declare.js";
import { NOTHING_DECLARED } from "./fixtures.js";

describe("declare", () => {
  it("overrides the members it is given and keeps the rest declaring nothing", () => {
    const declared = declare({ filter: { status: ["isAny"] } });
    expect(declared.filter).toEqual({ status: ["isAny"] });
    expect(declared.sort).toBe(NOTHING_DECLARED.sort);
  });
});
