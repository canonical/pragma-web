import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  localeConfig as config,
  greetingCatalogs,
} from "../../../testing/fixtures.js";
import { I18nProvider } from "../I18nProvider/index.js";
import useLocale from "./useLocale.js";
import useTranslation from "./useTranslation.js";

function WithProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <I18nProvider config={config} catalogs={greetingCatalogs}>
      {children}
    </I18nProvider>
  );
}

describe("useTranslation", () => {
  it("translates for the active locale", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: WithProvider,
    });
    expect(result.current.t("greeting", { name: "Ada" })).toBe("Hello, Ada!");
    expect(result.current.locale).toBe("en");
    expect(result.current.direction).toBe("ltr");
  });

  it("re-translates when the locale changes", () => {
    const { result } = renderHook(
      () => ({ translation: useTranslation(), locale: useLocale() }),
      { wrapper: WithProvider },
    );
    expect(result.current.translation.t("greeting", { name: "Ada" })).toBe(
      "Hello, Ada!",
    );
    act(() => result.current.locale.setLocale("fr"));
    expect(result.current.translation.t("greeting", { name: "Ada" })).toBe(
      "Bonjour, Ada !",
    );
  });

  it("returns the key (and RTL) for a locale with no catalog", () => {
    const { result } = renderHook(
      () => ({ translation: useTranslation(), locale: useLocale() }),
      { wrapper: WithProvider },
    );
    act(() => result.current.locale.setLocale("ar"));
    expect(result.current.translation.t("greeting")).toBe("greeting");
    expect(result.current.translation.direction).toBe("rtl");
  });

  it("returns the key when the provider has no catalogs", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <I18nProvider config={config}>{children}</I18nProvider>
      ),
    });
    expect(result.current.t("greeting")).toBe("greeting");
  });

  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useTranslation())).toThrow(
      "I18nProvider is required",
    );
  });
});
