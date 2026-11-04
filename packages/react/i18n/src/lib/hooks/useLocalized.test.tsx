import { createLocaleSource } from "@canonical/i18n-core";
import { act, render, renderHook, screen } from "@testing-library/react";
import { memo, type ReactNode } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  localeConfig as config,
  effectsOff,
  greetings,
  nameLabels,
} from "../../../testing/fixtures.js";
import type { Greetings } from "../../../testing/types.js";
import { I18nProvider } from "../I18nProvider/index.js";
import useLocale from "./useLocale.js";
import useLocalized from "./useLocalized.js";

function WithProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return <I18nProvider config={config}>{children}</I18nProvider>;
}

describe("useLocalized", () => {
  it("returns the active locale's entry", () => {
    const { result } = renderHook(() => useLocalized(greetings), {
      wrapper: WithProvider,
    });
    expect(result.current).toBe(greetings.en);
    expect(result.current.greeting("Ada")).toBe("Hello, \u2068Ada\u2069!");
    expectTypeOf(result.current).toEqualTypeOf<Greetings>();
  });

  it("returns the same object on every render of one locale", () => {
    const { result, rerender } = renderHook(() => useLocalized(greetings), {
      wrapper: WithProvider,
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("returns the new locale's entry when the locale changes", () => {
    const { result } = renderHook(
      () => ({ messages: useLocalized(greetings), locale: useLocale() }),
      { wrapper: WithProvider },
    );
    act(() => result.current.locale.setLocale("fr"));
    expect(result.current.messages).toBe(greetings.fr);
    expect(result.current.messages.items(2)).toBe("2 articles");
  });

  it("serves a regional tag from its language's entry", () => {
    const { result } = renderHook(
      () => ({ messages: useLocalized(greetings), locale: useLocale() }),
      { wrapper: WithProvider },
    );
    act(() => result.current.locale.setLocale("fr-CA"));
    expect(result.current.locale.locale).toBe("fr");
    expect(result.current.messages).toBe(greetings.fr);
  });

  it("reads any per-locale data, not only message records", () => {
    const { result } = renderHook(() => useLocalized(nameLabels), {
      wrapper: WithProvider,
    });
    expect(result.current).toBe("Name");
  });

  it("throws when the active locale has no entry", () => {
    expect(() =>
      renderHook(() => useLocalized(greetings), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <I18nProvider config={config} locale="ar">
            {children}
          </I18nProvider>
        ),
      }),
    ).toThrow('No translation for the active locale "ar".');
  });

  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useLocalized(greetings))).toThrow(
      "I18nProvider is required",
    );
  });

  describe("on a locale switch", () => {
    it("re-renders each reader once, in the new language", () => {
      const source = createLocaleSource(config, effectsOff);
      const renders = { page: 0, words: 0 };
      const Words = memo(function Words({
        messages,
      }: {
        messages: Greetings;
      }): React.ReactElement {
        renders.words += 1;
        return <p>{messages.greeting("Ada")}</p>;
      });
      function Page({ tick }: { tick: number }): React.ReactElement {
        const messages = useLocalized(greetings);
        renders.page += 1;
        return (
          <>
            <span>{`tick ${tick}`}</span>
            <Words messages={messages} />
          </>
        );
      }
      const buildPage = (tick: number): React.ReactElement => (
        <I18nProvider config={config} source={source}>
          <Page tick={tick} />
        </I18nProvider>
      );

      const { rerender } = render(buildPage(0));
      expect(renders).toEqual({ page: 1, words: 1 });

      // A re-render for another reason keeps the same record, so Words skips it.
      rerender(buildPage(1));
      expect(renders).toEqual({ page: 2, words: 1 });

      act(() => source.set("fr"));
      expect(renders).toEqual({ page: 3, words: 2 });
      expect(screen.getByText("Bonjour, \u2068Ada\u2069 !")).toBeTruthy();

      // A regional tag of the active language changes nothing.
      act(() => source.set("fr-CA"));
      expect(renders).toEqual({ page: 3, words: 2 });
    });
  });
});
