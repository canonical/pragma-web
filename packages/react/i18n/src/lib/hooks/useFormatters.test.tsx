import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  formattingConfig as config,
  emptyCatalogs,
} from "../../../testing/fixtures.js";
import { I18nProvider } from "../I18nProvider/index.js";
import useFormatters from "./useFormatters.js";
import useLocale from "./useLocale.js";

function WithProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <I18nProvider config={config} catalogs={emptyCatalogs} locale="en-US">
      {children}
    </I18nProvider>
  );
}

describe("useFormatters", () => {
  it("formats for the active locale", () => {
    const { result } = renderHook(() => useFormatters(), {
      wrapper: WithProvider,
    });
    expect(result.current.number(1234.5)).toBe("1,234.5");
  });

  it("re-formats when the locale changes", () => {
    const { result } = renderHook(
      () => ({ formatters: useFormatters(), locale: useLocale() }),
      { wrapper: WithProvider },
    );
    act(() => result.current.locale.setLocale("fr-FR"));
    expect(result.current.formatters.number(1234.5)).toBe("1\u202f234,5");
  });

  it("returns the same formatters across re-renders of one locale", () => {
    const { result, rerender } = renderHook(() => useFormatters(), {
      wrapper: WithProvider,
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
