import { describe, expect, it } from "vitest";
import coercePlacement from "./coercePlacement.js";

describe("coercePlacement", () => {
  it("coerces a bare logical side to a centred placement", () => {
    expect(coercePlacement("inline-end")).toEqual({
      side: "inline-end",
      align: "center",
    });
    expect(coercePlacement("block-start")).toEqual({
      side: "block-start",
      align: "center",
    });
  });

  it("passes a placement object through unchanged", () => {
    const placement = { side: "inline-end", align: "start" } as const;
    expect(coercePlacement(placement)).toBe(placement);
  });
});
