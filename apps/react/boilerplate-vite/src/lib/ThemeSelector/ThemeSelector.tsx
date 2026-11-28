import { useTranslation } from "@canonical/i18n-react";
import { Button } from "@canonical/react-ds-global";
import { SelectInput } from "@canonical/react-ds-global-form";
import { usePreferredTheme } from "@canonical/react-hooks";
import { type ChangeEvent, type ReactElement, useContext } from "react";
import ServerThemeContext from "./ServerThemeContext.js";

/**
 * The colour-theme picker. With JavaScript, a change applies at once:
 * `usePreferredTheme` swaps the class on `<html>` and writes the `theme`
 * cookie. Without JavaScript, the form posts to `/preferences`, which stores
 * the cookie and sends the reader back, and the server renders the theme
 * class on `<html>`; its Apply button is in `<noscript>`, so it never shows
 * while JavaScript runs.
 */
export default function ThemeSelector(): ReactElement {
  const { value, source, set, reset } = usePreferredTheme();
  const serverTheme = useContext(ServerThemeContext);
  const { t } = useTranslation();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const selected = event.target.value;

    if (selected === "system") {
      reset();
    } else {
      set(selected as "light" | "dark");
    }
  }

  // The hook cannot read the cookie on the server, so there the stored
  // theme comes from the server entry. In the browser the hook reads the same
  // cookie, so the first client render matches.
  const selectValue =
    typeof document === "undefined"
      ? (serverTheme ?? "system")
      : source === "system"
        ? "system"
        : value;

  return (
    <form action="/preferences" method="post">
      <SelectInput
        aria-label={t("theme.label")}
        name="theme"
        onChange={handleChange}
        options={[
          { value: "system", label: t("theme.system") },
          { value: "light", label: t("theme.light") },
          { value: "dark", label: t("theme.dark") },
        ]}
        value={selectValue}
      />
      <noscript>
        <Button importance="secondary" type="submit">
          {t("preferences.apply")}
        </Button>
      </noscript>
    </form>
  );
}
