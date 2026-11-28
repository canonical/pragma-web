// @vitest-environment node
import { I18nProvider } from "@canonical/i18n-react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { catalogs, i18nConfig } from "#i18n/index.js";
import ServerThemeContext from "./ServerThemeContext.js";
import ThemeSelector from "./ThemeSelector.js";

function renderOnServer(theme?: "light" | "dark") {
  return renderToString(
    <I18nProvider config={i18nConfig} catalogs={catalogs}>
      <ServerThemeContext.Provider value={theme}>
        <ThemeSelector />
      </ServerThemeContext.Provider>
    </I18nProvider>,
  );
}

describe("ThemeSelector on the server", () => {
  it("selects the theme the server read from the cookie", () => {
    expect(renderOnServer("dark")).toMatch(/<option value="dark" selected="">/);
  });

  it("selects System without a stored theme", () => {
    expect(renderOnServer()).toMatch(/<option value="system" selected="">/);
  });

  it("renders the Apply button for readers without JavaScript", () => {
    expect(renderOnServer()).toMatch(
      /<noscript><button[^>]*type="submit"[^>]*>.*Apply/,
    );
  });
});
