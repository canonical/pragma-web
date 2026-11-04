import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  localeConfig as config,
  emptyCatalogs,
} from "../../../testing/fixtures.js";
import { I18nProvider } from "../I18nProvider/index.js";
import useLocale from "./useLocale.js";

function WithProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <I18nProvider config={config} catalogs={emptyCatalogs}>
      {children}
    </I18nProvider>
  );
}

describe("useLocale", () => {
  it("exposes the locale, direction, and configured locales", () => {
    const { result } = renderHook(() => useLocale(), { wrapper: WithProvider });
    expect(result.current.locale).toBe("en");
    expect(result.current.direction).toBe("ltr");
    expect(result.current.locales).toEqual(["en", "fr", "ar"]);
  });

  it("changes the locale and direction via setLocale", () => {
    const { result } = renderHook(() => useLocale(), { wrapper: WithProvider });
    act(() => result.current.setLocale("ar"));
    expect(result.current.locale).toBe("ar");
    expect(result.current.direction).toBe("rtl");
  });

  it("refuses a tag that matches no configured locale, keeping the locale", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: WithProvider,
    });
    expect(() => result.current.setLocale("de")).toThrow(RangeError);
    expect(result.current.locale).toBe("en");
  });

  it("does not re-render for a tag of the current locale", () => {
    let renders = 0;
    const { result } = renderHook(
      () => {
        renders += 1;
        return useLocale();
      },
      { wrapper: WithProvider },
    );
    act(() => result.current.setLocale("fr"));
    const settled = renders;
    act(() => result.current.setLocale("FR"));
    act(() => result.current.setLocale("fr-CA"));
    expect(renders).toBe(settled);
    expect(result.current.locale).toBe("fr");
  });
});
