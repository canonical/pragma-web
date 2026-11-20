import { describe, expect, it } from "vitest";
import areMappingsEqual from "./areMappingsEqual.js";

describe("areMappingsEqual", () => {
  it("holds two mappings reading every part from the same field equal", () => {
    expect(
      areMappingsEqual(
        { dateTime: "at", actorId: "who" },
        { dateTime: "at", actorId: "who" },
      ),
    ).toBe(true);
  });

  it("tells mappings apart by any part's field, or a part one leaves out", () => {
    expect(areMappingsEqual({ dateTime: "at" }, { dateTime: "on" })).toBe(
      false,
    );
    expect(
      areMappingsEqual(
        { dateTime: "at" },
        { dateTime: "at", description: "s" },
      ),
    ).toBe(false);
  });
});
