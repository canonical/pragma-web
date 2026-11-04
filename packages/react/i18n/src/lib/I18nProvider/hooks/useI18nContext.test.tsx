import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { emptyCatalogs, localeConfig } from "../../../../testing/fixtures.js";
import { I18nProvider } from "../index.js";
import useI18nContext from "./useI18nContext.js";

function WithProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <I18nProvider config={localeConfig} catalogs={emptyCatalogs}>
      {children}
    </I18nProvider>
  );
}

describe("useI18nContext", () => {
  it("returns the value of the nearest provider", () => {
    const { result } = renderHook(() => useI18nContext(), {
      wrapper: WithProvider,
    });
    expect(result.current.config).toBe(localeConfig);
    expect(result.current.source.get()).toBe("en");
  });

  it("throws outside a provider", () => {
    expect(() => renderHook(() => useI18nContext())).toThrow(
      "I18nProvider is required to use i18n-react hooks.",
    );
  });
});
