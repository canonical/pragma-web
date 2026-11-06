import { describe, expect, it } from "vitest";
import refusedWith from "./refusedWith.js";

describe("refusedWith", () => {
  it("refuses the sort once for each reason", () => {
    expect(refusedWith("a", "b").refusals.map(({ reason }) => reason)).toEqual([
      "a",
      "b",
    ]);
  });
});
