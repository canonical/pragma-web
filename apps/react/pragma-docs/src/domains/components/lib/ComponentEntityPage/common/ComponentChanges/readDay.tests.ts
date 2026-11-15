import { describe, expect, it } from "vitest";
import readDay from "./readDay.js";

describe("readDay", () => {
  it("returns the day a timestamp names, as written", () => {
    expect(readDay("2026-03-06T11:00:00.000+01:00")).toBe("2026-03-06");
  });

  it("returns a timestamp that starts with no day whole", () => {
    expect(readDay("March")).toBe("March");
  });
});
