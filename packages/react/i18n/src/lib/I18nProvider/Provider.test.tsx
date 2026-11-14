import { createLocaleSource, type Locale } from "@canonical/i18n-core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  greetingCatalogs as catalogs,
  localeConfig as config,
  effectsOff,
} from "../../../testing/fixtures.js";
import { useLocale, useTranslation } from "../hooks/index.js";
import I18nProvider from "./Provider.js";

function Greeting(): React.ReactElement {
  const { t } = useTranslation();
  return <p>{t("greeting", { name: "Ada" })}</p>;
}

function ShowLocale(): React.ReactElement {
  const { locale } = useLocale();
  return <span>{locale}</span>;
}

function SwitchTo({ locale }: { locale: Locale }): React.ReactElement {
  const { setLocale } = useLocale();
  return (
    <button type="button" onClick={() => setLocale(locale)}>
      switch-{locale}
    </button>
  );
}

describe("I18nProvider", () => {
  it("shows as I18nProvider in React DevTools and component stacks", () => {
    expect(I18nProvider.displayName).toBe("I18nProvider");
  });

  it("renders translated content for the default locale", () => {
    render(
      <I18nProvider config={config} catalogs={catalogs}>
        <Greeting />
      </I18nProvider>,
    );
    expect(screen.getByText("Hello, Ada!")).toBeTruthy();
  });

  it("starts at an explicit initial locale", () => {
    render(
      <I18nProvider config={config} catalogs={catalogs} locale="fr">
        <ShowLocale />
      </I18nProvider>,
    );
    expect(screen.getByText("fr")).toBeTruthy();
  });

  it("binds to an external locale source when provided", () => {
    const source = createLocaleSource(config, {
      ...effectsOff,
      initial: "fr",
    });
    render(
      <I18nProvider config={config} catalogs={catalogs} source={source}>
        <ShowLocale />
      </I18nProvider>,
    );
    expect(screen.getByText("fr")).toBeTruthy();
  });

  it("keeps a runtime locale switch across provider re-renders", () => {
    const buildApp = (locale: Locale): React.ReactElement => (
      <I18nProvider config={config} catalogs={catalogs} locale={locale}>
        <Greeting />
        <ShowLocale />
        <SwitchTo locale="fr" />
      </I18nProvider>
    );
    const { rerender } = render(buildApp("en"));
    fireEvent.click(screen.getByText("switch-fr"));
    expect(screen.getByText("Bonjour, Ada !")).toBeTruthy();

    // A parent re-render — even one passing a different `locale` prop — must
    // not clobber the runtime choice: the prop is the SSR-negotiated initial.
    rerender(buildApp("ar"));
    expect(screen.getByText("fr")).toBeTruthy();
    expect(screen.getByText("Bonjour, Ada !")).toBeTruthy();
  });

  it("propagates a shared external source switch to every provider tree", () => {
    const source = createLocaleSource(config, {
      ...effectsOff,
      initial: "en",
    });
    render(
      <>
        <I18nProvider config={config} catalogs={catalogs} source={source}>
          <Greeting />
        </I18nProvider>
        <I18nProvider config={config} catalogs={catalogs} source={source}>
          <ShowLocale />
        </I18nProvider>
      </>,
    );
    act(() => source.set("fr"));
    expect(screen.getByText("Bonjour, Ada !")).toBeTruthy();
    expect(screen.getByText("fr")).toBeTruthy();

    // …and survives the round-trip back.
    act(() => source.set("en"));
    expect(screen.getByText("Hello, Ada!")).toBeTruthy();
    expect(screen.getByText("en")).toBeTruthy();
  });
});
