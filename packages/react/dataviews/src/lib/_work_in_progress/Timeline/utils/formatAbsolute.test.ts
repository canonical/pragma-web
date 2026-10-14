import { describe, expect, it } from "vitest";
import formatAbsolute from "./formatAbsolute.js";

const spaced = (text: string): string => text.replace(/\s/gu, " ");

describe("formatAbsolute", () => {
  it("writes a date-time as its date and time in the zone it is given", () => {
    expect(spaced(formatAbsolute("2024-06-15T12:00:00Z", "en", "UTC"))).toBe(
      "Jun 15, 2024, 12:00 PM",
    );
    expect(
      spaced(formatAbsolute("2024-06-15T12:00:00Z", "en", "Asia/Tokyo")),
    ).toBe("Jun 15, 2024, 9:00 PM");
  });

  it("reads the offset a date-time carries", () => {
    expect(
      spaced(formatAbsolute("2024-06-15T07:00:00-05:00", "en", "UTC")),
    ).toBe("Jun 15, 2024, 12:00 PM");
  });

  it("writes a calendar date as the date it names in any zone", () => {
    expect(formatAbsolute("2024-06-15", "en", "America/Los_Angeles")).toBe(
      "Jun 15, 2024",
    );
    expect(formatAbsolute("2024-06-15", "en", "Pacific/Kiritimati")).toBe(
      "Jun 15, 2024",
    );
  });

  it("writes in the locale it is given", () => {
    expect(formatAbsolute("2024-06-15", "de")).toBe("15.06.2024");
  });

  it("writes a date-time in the runtime's zone without one", () => {
    expect(formatAbsolute("2024-06-15T12:00:00Z", "en")).toBe(
      new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(Date.UTC(2024, 5, 15, 12)),
    );
  });

  it("writes nothing for a value the core reads no instant from", () => {
    expect(formatAbsolute("2024-02-30", "en")).toBe("");
    expect(formatAbsolute("2024-06-15T12:00", "en")).toBe("");
    expect(formatAbsolute("yesterday", "en")).toBe("");
  });
});
