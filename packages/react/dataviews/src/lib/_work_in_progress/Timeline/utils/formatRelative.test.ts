import { describe, expect, it } from "vitest";
import formatRelative from "./formatRelative.js";

const NOW = Date.UTC(2024, 5, 15, 12);
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelative", () => {
  it("writes an instant in the largest unit it spans", () => {
    expect(formatRelative(NOW - 30 * SECOND, NOW, "en")).toBe("30 seconds ago");
    expect(formatRelative(NOW - 5 * MINUTE, NOW, "en")).toBe("5 minutes ago");
    expect(formatRelative(NOW + 2 * HOUR, NOW, "en")).toBe("in 2 hours");
    expect(formatRelative(NOW - 2 * DAY, NOW, "en")).toBe("2 days ago");
    expect(formatRelative(NOW - 14 * DAY, NOW, "en")).toBe("2 weeks ago");
    expect(formatRelative(NOW - 66 * DAY, NOW, "en")).toBe("2 months ago");
    expect(formatRelative(NOW + 730 * DAY, NOW, "en")).toBe("in 2 years");
  });

  it("rounds the amount before choosing its unit", () => {
    expect(formatRelative(NOW - 59.6 * SECOND, NOW, "en")).toBe("1 minute ago");
    expect(formatRelative(NOW - DAY + 400, NOW, "en")).toBe("yesterday");
    expect(formatRelative(NOW - 7 * DAY + 400, NOW, "en")).toBe("last week");
  });

  it("writes in the locale it is given", () => {
    expect(formatRelative(NOW - 2 * DAY, NOW, "fr")).toBe("avant-hier");
  });

  it("writes nothing for an instant that is not a number", () => {
    expect(formatRelative(Number.NaN, NOW, "en")).toBe("");
  });
});
