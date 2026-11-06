import { describe, expect, it } from "vitest";
import atLeast from "./atLeast.js";

describe("atLeast", () => {
  it("counts a lower bound", () => {
    expect(atLeast(3)).toEqual({ kind: "at-least", value: 3 });
  });
});
