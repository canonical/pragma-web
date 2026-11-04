import { afterEach, describe, expect, it, vi } from "vitest";
import createFormatters from "./createFormatters.js";

describe("createFormatters", () => {
  const en = createFormatters("en-US");

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("formats numbers and currency", () => {
    expect(en.number(1234.5)).toBe("1,234.5");
    expect(en.currency(1234.5, "USD")).toBe("$1,234.50");
  });

  describe("date", () => {
    it("formats a date with the given options", () => {
      const date = new Date(Date.UTC(2026, 0, 15, 9, 5));
      expect(en.date(date, { dateStyle: "medium", timeZone: "UTC" })).toBe(
        "Jan 15, 2026",
      );
      expect(en.date(0, { timeZone: "UTC" })).toBe("1/1/1970");
    });

    it("uses the locale's default date when no options are given", () => {
      expect(en.date(0)).toMatch(/^\d{1,2}\/\d{1,2}\/19(69|70)$/);
    });
  });

  describe("time", () => {
    const date = new Date(Date.UTC(2026, 0, 15, 9, 5));

    it("formats the short time when options name no field", () => {
      expect(en.time(date, { timeZone: "UTC" })).toBe("9:05 AM");
      expect(en.time(date, { timeZone: "UTC", hour12: false })).toBe("09:05");
    });

    it.each<[Intl.DateTimeFormatOptions, string]>([
      [{ year: "numeric", hour: "numeric" }, "2026, 9 AM"],
      [{ hour: "numeric" }, "9 AM"],
      [{ minute: "2-digit" }, "5"],
      [{ second: "2-digit" }, "0"],
      [{ dayPeriod: "short" }, "in the morning"],
      [{ fractionalSecondDigits: 2 }, "00"],
      [{ timeStyle: "short" }, "9:05 AM"],
    ])("keeps the time field in %o", (options, expected) => {
      expect(en.time(date, { ...options, timeZone: "UTC" })).toBe(expected);
    });

    it.each<[Intl.DateTimeFormatOptions, string]>([
      [{ weekday: "short" }, "Thu 9:05 AM"],
      [{ era: "short" }, "AD, 9:05 AM"],
      [{ year: "numeric" }, "2026, 9:05 AM"],
      [{ month: "short" }, "Jan, 9:05 AM"],
      [{ day: "numeric" }, "15, 9:05 AM"],
      [{ timeZoneName: "short" }, "9:05 AM UTC"],
    ])("adds the hour and minute to %o", (options, expected) => {
      expect(en.time(date, { ...options, timeZone: "UTC" })).toBe(expected);
    });

    it("adds the short time to a date style", () => {
      expect(en.time(date, { dateStyle: "medium", timeZone: "UTC" })).toBe(
        "Jan 15, 2026, 9:05 AM",
      );
    });

    it("formats the short time when no options are given", () => {
      expect(en.time(date)).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/);
    });
  });

  it("formats relative time and lists", () => {
    expect(en.relativeTime(-3, "day", { numeric: "auto" })).toBe("3 days ago");
    expect(en.list(["A", "B", "C"])).toBe("A, B, and C");
  });

  it("produces locale-specific output", () => {
    const fr = createFormatters("fr-FR");
    expect(fr.number(1234.5)).toBe("1\u202f234,5");
  });

  it("constructs one Intl instance per distinct options (memoized)", () => {
    const RealNumberFormat = Intl.NumberFormat;
    let constructed = 0;
    class CountingNumberFormat extends RealNumberFormat {
      constructor(...args: ConstructorParameters<typeof Intl.NumberFormat>) {
        super(...args);
        constructed += 1;
      }
    }
    vi.stubGlobal("Intl", { ...Intl, NumberFormat: CountingNumberFormat });

    const formatters = createFormatters("en-US");
    formatters.number(1000);
    formatters.number(2000); // same default options → cached, no new instance
    formatters.currency(5, "USD"); // distinct options → one more instance

    expect(constructed).toBe(2);
  });
});
