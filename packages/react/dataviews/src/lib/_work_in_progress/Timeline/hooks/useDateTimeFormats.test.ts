import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useDateTimeFormats from "./useDateTimeFormats.js";

const VALUE = "2024-06-15T10:00:00Z";

describe("useDateTimeFormats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2024, 5, 15, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the absolute form, with the relative one as its alternate", () => {
    const { result } = renderHook(() =>
      useDateTimeFormats({ timeZone: "UTC" }),
    );
    expect(result.current.mode).toBe("absolute");
    expect(result.current.format(VALUE)).toEqual({
      display: expect.stringMatching(/^Jun 15, 2024, 10:00\sAM$/u),
      alternate: "2 hours ago",
    });
  });

  it("switches every date to the relative form on toggle, and back", () => {
    const { result } = renderHook(() =>
      useDateTimeFormats({ timeZone: "UTC" }),
    );
    act(() => result.current.toggle());
    expect(result.current.mode).toBe("relative");
    expect(result.current.format(VALUE)).toEqual({
      display: "2 hours ago",
      alternate: expect.stringMatching(/^Jun 15, 2024, 10:00\sAM$/u),
    });
    act(() => result.current.toggle());
    expect(result.current.mode).toBe("absolute");
  });

  it("keeps the absolute form where the formats allow no toggling", () => {
    const { result } = renderHook(() =>
      useDateTimeFormats({ toggleable: false }),
    );
    act(() => result.current.toggle());
    expect(result.current.mode).toBe("absolute");
    expect(result.current.toggleable).toBe(false);
  });

  it("writes in the locale the formats name, and English without one", () => {
    const { result: german } = renderHook(() =>
      useDateTimeFormats({ locale: "de" }),
    );
    expect(german.current.format("2024-06-15").display).toBe("15.06.2024");
    const { result: english } = renderHook(() => useDateTimeFormats(undefined));
    expect(english.current.format("2024-06-15").display).toBe("Jun 15, 2024");
  });

  it("writes through the formats' own writers, handing them the locale", () => {
    const { result } = renderHook(() =>
      useDateTimeFormats({
        locale: "fr",
        formatAbsolute: (value, locale) => `abs:${value}:${locale}`,
        formatRelative: (value, now, locale) => `rel:${value}:${now}:${locale}`,
      }),
    );
    expect(result.current.format(VALUE)).toEqual({
      display: `abs:${VALUE}:fr`,
      alternate: `rel:${VALUE}:${Date.UTC(2024, 5, 15, 12)}:fr`,
    });
  });

  it("falls back to the absolute form where the relative one writes nothing", () => {
    const { result } = renderHook(() =>
      useDateTimeFormats({ formatRelative: () => "" }),
    );
    act(() => result.current.toggle());
    const { display, alternate } = result.current.format(VALUE);
    expect(display).not.toBe("");
    expect(alternate).toBe(display);
  });

  it("writes nothing for a value the core reads no instant from", () => {
    const { result } = renderHook(() => useDateTimeFormats(undefined));
    expect(result.current.format("not a date")).toEqual({
      display: "",
      alternate: "",
    });
  });

  it("shows tooltips unless the formats turn them off", () => {
    const { result: shown } = renderHook(() => useDateTimeFormats(undefined));
    expect(shown.current.tooltip).toBe(true);
    const { result: hidden } = renderHook(() =>
      useDateTimeFormats({ tooltip: false }),
    );
    expect(hidden.current.tooltip).toBe(false);
  });
});
