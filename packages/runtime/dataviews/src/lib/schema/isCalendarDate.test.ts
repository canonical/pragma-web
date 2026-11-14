import { describe, expect, it } from "vitest";
import isCalendarDate from "./isCalendarDate.js";

describe("isCalendarDate", () => {
  it("accepts a real calendar date and nothing else", () => {
    expect(isCalendarDate("2026-01-02")).toBe(true);
    expect(isCalendarDate("2026-02-30")).toBe(false);
    expect(isCalendarDate("2026-01-02T06:00:00Z")).toBe(false);
  });

  it("refuses a month outside the year", () => {
    expect(isCalendarDate("2026-00-01")).toBe(false);
    expect(isCalendarDate("2026-13-01")).toBe(false);
  });

  it("refuses a day outside the month", () => {
    expect(isCalendarDate("2026-01-00")).toBe(false);
    expect(isCalendarDate("2026-04-31")).toBe(false);
    expect(isCalendarDate("2026-12-31")).toBe(true);
  });

  it("gives February a 29th in a leap year only", () => {
    expect(isCalendarDate("2024-02-29")).toBe(true);
    expect(isCalendarDate("2000-02-29")).toBe(true);
    expect(isCalendarDate("2025-02-29")).toBe(false);
    expect(isCalendarDate("1900-02-29")).toBe(false);
    expect(isCalendarDate("2025-02-28")).toBe(true);
  });
});
