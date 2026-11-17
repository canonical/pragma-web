import { describe, expect, it } from "vitest";
import countExactly from "./countExactly.js";

describe("countExactly", () => {
  it("counts exactly", () => {
    expect(countExactly(3)).toEqual({ kind: "exact", value: 3 });
  });
});
