import { usePreferredTheme } from "@canonical/react-hooks";
import type { ChangeEvent, ReactElement } from "react";
import { useMessages } from "../i18n/index.js";
import type { ThemeSelectorProps } from "./types.js";

const componentCssClassName = "ds theme-selector";

/**
 * The colour-theme control: a select offering the system theme, light and
 * dark, backed by `usePreferredTheme` (a cookie, so the server renders the
 * reader's choice on the next request).
 *
 * Choosing "System" clears the stored preference; choosing "Light" or "Dark"
 * stores it. The select shows "System" while no preference is stored, and
 * the stored theme otherwise. Native `<select>` props pass through to the
 * root, a consumer `className` merges after the component's own, and an
 * `aria-label` (or an `aria-labelledby`, which takes precedence) replaces
 * the default accessible name.
 *
 * `import { ThemeSelector } from "@canonical/prism-core";`
 */
export default function ThemeSelector({
  "aria-label": ariaLabel,
  className,
  ...props
}: ThemeSelectorProps): ReactElement {
  const t = useMessages();
  const { value, source, set, reset } = usePreferredTheme();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const selected = event.target.value;

    if (selected === "system") {
      reset();
    } else {
      set(selected as "light" | "dark");
    }
  }

  const selectValue = source === "system" ? "system" : value;

  return (
    <select
      {...props}
      aria-label={ariaLabel ?? t("themeSelector.label")}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      onChange={handleChange}
      value={selectValue}
    >
      <option value="system">{t("themeSelector.system")}</option>
      <option value="light">{t("themeSelector.light")}</option>
      <option value="dark">{t("themeSelector.dark")}</option>
    </select>
  );
}
