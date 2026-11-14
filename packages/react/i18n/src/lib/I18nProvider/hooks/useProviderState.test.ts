import { createLocaleSource } from "@canonical/i18n-core";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  effectsOff,
  emptyCatalogs,
  greetingCatalogs,
  localeConfig,
} from "../../../../testing/fixtures.js";
import useProviderState from "./useProviderState.js";

const base = { config: localeConfig, catalogs: emptyCatalogs };

describe("useProviderState", () => {
  afterEach(() => {
    document.documentElement.lang = "";
    document.documentElement.dir = "";
  });

  it("owns a source that starts at the given locale", () => {
    const { result } = renderHook(() =>
      useProviderState({ ...base, locale: "fr" }),
    );
    expect(result.current.source.get()).toBe("fr");
    expect(result.current.config).toBe(localeConfig);
  });

  it("starts its own source at the default locale when none is given", () => {
    const { result } = renderHook(() => useProviderState(base));
    expect(result.current.source.get()).toBe("en");
  });

  it("reflects its own source's initial locale onto the document on mount", () => {
    renderHook(() => useProviderState({ ...base, locale: "ar" }));
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("uses an external source when one is given", () => {
    const source = createLocaleSource(localeConfig, {
      ...effectsOff,
      initial: "ar",
    });
    const { result } = renderHook(() => useProviderState({ ...base, source }));
    expect(result.current.source).toBe(source);
  });

  it("passes on the catalogs it is given", () => {
    const { result } = renderHook(() =>
      useProviderState({ ...base, catalogs: greetingCatalogs }),
    );
    expect(result.current.catalogs).toBe(greetingCatalogs);
  });

  it("keeps the same value across re-renders with the same props", () => {
    const { result, rerender } = renderHook(() => useProviderState(base));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("returns a new value when the catalogs change", () => {
    const { result, rerender } = renderHook(
      ({ catalogs }) => useProviderState({ ...base, catalogs }),
      { initialProps: { catalogs: greetingCatalogs } },
    );
    const first = result.current;
    rerender({ catalogs: emptyCatalogs });
    expect(result.current).not.toBe(first);
  });

  it("returns a new value when the config changes", () => {
    const { result, rerender } = renderHook(
      ({ config }) => useProviderState({ ...base, config }),
      { initialProps: { config: localeConfig } },
    );
    const first = result.current;
    rerender({ config: { ...localeConfig } });
    expect(result.current).not.toBe(first);
  });

  it("returns a new value when the external source changes", () => {
    const first = createLocaleSource(localeConfig, effectsOff);
    const second = createLocaleSource(localeConfig, effectsOff);
    const { result, rerender } = renderHook(
      ({ source }) => useProviderState({ ...base, source }),
      { initialProps: { source: first } },
    );
    rerender({ source: second });
    expect(result.current.source).toBe(second);
  });
});
