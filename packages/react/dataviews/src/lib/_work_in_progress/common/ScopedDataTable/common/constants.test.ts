import { describe, expect, it } from "vitest";
import { DEFAULT_SIZING } from "./constants.js";

describe("constants", () => {
  it("sizes an unsized column flexibly, with a 96px floor", () => {
    expect(DEFAULT_SIZING).toEqual({ kind: "flex", weight: 1, minPx: 96 });
  });
});
