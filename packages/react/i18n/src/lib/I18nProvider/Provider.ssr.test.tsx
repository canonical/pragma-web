import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  greetingCatalogs as catalogs,
  localeConfig as config,
} from "../../../testing/fixtures.js";
import { useLocale, useTranslation } from "../hooks/index.js";
import I18nProvider from "./Provider.js";

function Greeting(): React.ReactElement {
  const { t, direction } = useTranslation();
  return <p dir={direction}>{t("greeting", { name: "Ada" })}</p>;
}

function ShowDirection(): React.ReactElement {
  const { direction } = useLocale();
  return <p dir={direction}>content</p>;
}

describe("I18nProvider SSR", () => {
  it("renders translated markup for the negotiated locale without throwing", () => {
    const html = renderToString(
      <I18nProvider config={config} catalogs={catalogs} locale="fr">
        <Greeting />
      </I18nProvider>,
    );
    expect(html).toContain("Bonjour, Ada !");
  });

  it("reflects RTL direction for Arabic", () => {
    const html = renderToString(
      <I18nProvider config={config} catalogs={catalogs} locale="ar">
        <ShowDirection />
      </I18nProvider>,
    );
    expect(html).toContain('dir="rtl"');
  });
});
