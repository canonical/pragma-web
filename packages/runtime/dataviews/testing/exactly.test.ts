import { describe, expect, it } from "vitest";
import exactly from "./exactly.js";

describe("exactly", () => {
  it("counts exactly", () => {
    expect(exactly(3)).toEqual({ kind: "exact", value: 3 });
  });
});
