import { describe, expect, it } from "vitest";
import countAtLeast from "./countAtLeast.js";

describe("countAtLeast", () => {
  it("counts a lower bound", () => {
    expect(countAtLeast(3)).toEqual({ kind: "at-least", value: 3 });
  });
});
