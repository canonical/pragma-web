import type { Locale } from "@canonical/i18n-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { localeConfig as config, rows } from "../../../testing/fixtures.js";
import type { Rows } from "../../../testing/types.js";
import { I18nProvider } from "../I18nProvider/index.js";
import useLocalized from "./useLocalized.js";

function renderRequest(
  locale: Locale,
  count: number,
  seen: Rows[] = [],
): string {
  function Selection(): React.ReactElement {
    const messages = useLocalized(rows);
    seen.push(messages);
    return <p>{messages.rowsSelected(count)}</p>;
  }
  return renderToString(
    <I18nProvider config={config} locale={locale}>
      <Selection />
    </I18nProvider>,
  );
}

describe("useLocalized SSR", () => {
  it("renders the negotiated locale's words", () => {
    expect(renderRequest("fr", 1)).toContain("1 ligne sélectionnée");
  });

  it("serves requests in different locales from the same module-level records", () => {
    const seen: Rows[] = [];
    const first = renderRequest("en", 2, seen);
    const second = renderRequest("fr", 1_000_000, seen);
    const third = renderRequest("en", 1, seen);

    expect(first).toContain("2 rows selected");
    expect(second).toContain("de lignes sélectionnées");
    expect(third).toContain("1 row selected");
    expect(seen).toHaveLength(3);
    expect(seen.at(0)).toBe(rows.en);
    expect(seen.at(1)).toBe(rows.fr);
    expect(seen.at(2)).toBe(rows.en);
  });

  it("throws when the negotiated locale has no entry", () => {
    expect(() => renderRequest("ar", 1)).toThrow(
      'No translation for the active locale "ar".',
    );
  });
});
