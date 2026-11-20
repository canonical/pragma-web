import { afterEach, describe, expect, it, vi } from "vitest";
import { arabicItemForms } from "../../testing/fixtures.js";
import createFormatters from "./createFormatters.js";

describe("createFormatters", () => {
  const en = createFormatters("en-US");

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("formats numbers and currency", () => {
    expect(en.formatNumber(1234.5)).toBe("1,234.5");
    expect(en.formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });

  describe("formatDate", () => {
    it("formats a date with the given options", () => {
      const date = new Date(Date.UTC(2026, 0, 15, 9, 5));
      expect(
        en.formatDate(date, { dateStyle: "medium", timeZone: "UTC" }),
      ).toBe("Jan 15, 2026");
      expect(en.formatDate(0, { timeZone: "UTC" })).toBe("1/1/1970");
    });

    it("uses the locale's default date when no options are given", () => {
      expect(en.formatDate(0)).toMatch(/^\d{1,2}\/\d{1,2}\/19(69|70)$/);
    });
  });

  describe("formatTime", () => {
    const date = new Date(Date.UTC(2026, 0, 15, 9, 5));

    it("formats the short time when options name no field", () => {
      expect(en.formatTime(date, { timeZone: "UTC" })).toBe("9:05 AM");
      expect(en.formatTime(date, { timeZone: "UTC", hour12: false })).toBe(
        "09:05",
      );
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
      expect(en.formatTime(date, { ...options, timeZone: "UTC" })).toBe(
        expected,
      );
    });

    it.each<[Intl.DateTimeFormatOptions, string]>([
      [{ weekday: "short" }, "Thu 9:05 AM"],
      [{ era: "short" }, "AD, 9:05 AM"],
      [{ year: "numeric" }, "2026, 9:05 AM"],
      [{ month: "short" }, "Jan, 9:05 AM"],
      [{ day: "numeric" }, "15, 9:05 AM"],
      [{ timeZoneName: "short" }, "9:05 AM UTC"],
    ])("adds the hour and minute to %o", (options, expected) => {
      expect(en.formatTime(date, { ...options, timeZone: "UTC" })).toBe(
        expected,
      );
    });

    it("adds the short time to a date style", () => {
      expect(
        en.formatTime(date, { dateStyle: "medium", timeZone: "UTC" }),
      ).toBe("Jan 15, 2026, 9:05 AM");
    });

    it("formats the short time when no options are given", () => {
      expect(en.formatTime(date)).toMatch(/^\d{1,2}:\d{2}\s[AP]M$/);
    });
  });

  it("formats relative time and lists", () => {
    expect(en.formatRelativeTime(-3, "day", { numeric: "auto" })).toBe(
      "3 days ago",
    );
    expect(en.formatList(["A", "B", "C"])).toBe("A, B, and C");
  });

  it("produces locale-specific output", () => {
    const fr = createFormatters("fr-FR");
    expect(fr.formatNumber(1234.5)).toBe("1\u202f234,5");
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
    vi.stubGlobal(
      "Intl",
      Object.create(Intl, { NumberFormat: { value: CountingNumberFormat } }),
    );

    const formatters = createFormatters("en-US");
    formatters.formatNumber(1000);
    formatters.formatNumber(2000); // same default options → cached, no new instance
    formatters.formatCurrency(5, "USD"); // distinct options → one more instance

    expect(constructed).toBe(2);
  });

  describe("selectPlural", () => {
    it("selects an English plural form by count", () => {
      const wordItems = (count: number) =>
        en.selectPlural(count, {
          one: `${count} item`,
          other: `${count} items`,
        });
      expect(wordItems(1)).toBe("1 item");
      expect(wordItems(5)).toBe("5 items");
    });

    it("uses locale-specific plural categories", () => {
      const ar = createFormatters("ar");
      expect(ar.selectPlural(0, arabicItemForms)).toBe("لا عناصر");
      expect(ar.selectPlural(1, arabicItemForms)).toBe("عنصر");
      expect(ar.selectPlural(2, arabicItemForms)).toBe("عنصران");
      expect(ar.selectPlural(3, arabicItemForms)).toBe("3 عناصر");
      expect(ar.selectPlural(11, arabicItemForms)).toBe("11 عنصرًا");
      expect(ar.selectPlural(100, arabicItemForms)).toBe("100 عنصر");
    });

    it("falls back to other when the selected category is undefined", () => {
      const ar = createFormatters("ar");
      expect(ar.selectPlural(3, { other: "3 other" })).toBe("3 other");
    });

    it("selects other for a count that is not a finite number", () => {
      expect(en.selectPlural(Number.NaN, { one: "one", other: "other" })).toBe(
        "other",
      );
    });
  });

  describe("selectOrdinal", () => {
    it("selects a form under the locale's ordinal rules", () => {
      const wordPlace = (position: number) =>
        en.selectOrdinal(position, {
          one: `${position}st`,
          two: `${position}nd`,
          few: `${position}rd`,
          other: `${position}th`,
        });
      expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 111].map(wordPlace)).toEqual([
        "1st",
        "2nd",
        "3rd",
        "4th",
        "11th",
        "12th",
        "13th",
        "21st",
        "22nd",
        "23rd",
        "111th",
      ]);
    });

    it("falls back to other when the selected category is undefined", () => {
      expect(
        en.selectOrdinal(2, { one: "first", other: "another place" }),
      ).toBe("another place");
    });

    it("uses one form when the locale has a single ordinal category", () => {
      const ar = createFormatters("ar");
      expect(ar.selectOrdinal(1, { one: "unused", other: "الأول" })).toBe(
        "الأول",
      );
    });
  });

  describe("isolate", () => {
    it("wraps text in first-strong isolate and pop directional isolate", () => {
      expect(en.isolate("Ada")).toBe("\u2068Ada\u2069");
    });

    it("keeps a right-to-left name whole inside a left-to-right sentence", () => {
      const sentence = `Select ${en.isolate("أحمد")} now`;
      expect(sentence).toBe("Select \u2068أحمد\u2069 now");
    });
  });

  describe("strict mode", () => {
    const fr = createFormatters("fr", { strict: true });
    const strictEn = createFormatters("en", { strict: true });

    it("throws a RangeError naming each plural category the forms lack", () => {
      expect(() =>
        fr.selectPlural(2, { one: "ligne", other: "lignes" }),
      ).toThrow(
        new RangeError('Missing cardinal plural forms for "fr": many.'),
      );
      const ar = createFormatters("ar", { strict: true });
      expect(() => ar.selectPlural(1, { one: "عنصر", other: "عنصر" })).toThrow(
        new RangeError(
          'Missing cardinal plural forms for "ar": zero, two, few, many.',
        ),
      );
    });

    it("throws a RangeError naming each ordinal category the forms lack", () => {
      expect(() =>
        strictEn.selectOrdinal(4, { one: "1st", other: "4th" }),
      ).toThrow(
        new RangeError('Missing ordinal plural forms for "en": two, few.'),
      );
    });

    it("throws even when the selected category is present", () => {
      expect(() =>
        fr.selectPlural(1, { one: "ligne", other: "lignes" }),
      ).toThrow(RangeError);
    });

    it("selects a form when every category is present", () => {
      expect(
        fr.selectPlural(1_000_000, {
          one: "ligne",
          many: "de lignes",
          other: "lignes",
        }),
      ).toBe("de lignes");
      expect(
        strictEn.selectOrdinal(3, {
          one: "1st",
          two: "2nd",
          few: "3rd",
          other: "4th",
        }),
      ).toBe("3rd");
    });

    it("leaves the other formatters unchanged", () => {
      expect(strictEn.formatNumber(1234.5)).toBe("1,234.5");
      expect(strictEn.isolate("Ada")).toBe("\u2068Ada\u2069");
    });

    it("accepts a form the locale never selects", () => {
      expect(
        strictEn.selectPlural(0, { zero: "none", one: "one", other: "many" }),
      ).toBe("many");
    });

    it("is off by default", () => {
      const lenient = createFormatters("fr", {});
      expect(lenient.selectPlural(2, { one: "ligne", other: "lignes" })).toBe(
        "lignes",
      );
    });
  });

  it("constructs one Intl.PluralRules per rule type (memoized)", () => {
    const RealPluralRules = Intl.PluralRules;
    let constructed = 0;
    class CountingPluralRules extends RealPluralRules {
      constructor(...args: ConstructorParameters<typeof Intl.PluralRules>) {
        super(...args);
        constructed += 1;
      }
    }
    vi.stubGlobal(
      "Intl",
      Object.create(Intl, { PluralRules: { value: CountingPluralRules } }),
    );

    const formatters = createFormatters("en");
    formatters.selectPlural(1, { other: "items" });
    formatters.selectPlural(2, { other: "items" }); // cardinal rules → cached
    formatters.selectOrdinal(3, { other: "3rd" }); // ordinal rules → one more
    formatters.selectOrdinal(4, { other: "4th" }); // ordinal rules → cached

    expect(constructed).toBe(2);
  });
});
