import { describe, expect, it } from "vitest";
import selectRelativeTime from "./selectRelativeTime.js";

describe("selectRelativeTime", () => {
  it("uses minutes under an hour", () => {
    expect(selectRelativeTime(2)).toEqual({ value: -2, unit: "minute" });
    expect(selectRelativeTime(59)).toEqual({ value: -59, unit: "minute" });
  });

  it("uses whole hours under a day", () => {
    expect(selectRelativeTime(60)).toEqual({ value: -1, unit: "hour" });
    expect(selectRelativeTime(150)).toEqual({ value: -3, unit: "hour" });
  });

  it("uses whole days beyond", () => {
    expect(selectRelativeTime(24 * 60)).toEqual({ value: -1, unit: "day" });
    expect(selectRelativeTime(3 * 24 * 60)).toEqual({ value: -3, unit: "day" });
  });
});
