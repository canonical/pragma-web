import { usePreferredTheme } from "@canonical/react-hooks";
import type { ChangeEvent, ReactElement } from "react";

/**
 * The colour-theme control: a select offering the system theme, light and
 * dark, backed by `usePreferredTheme` (a cookie, so the server renders the
 * reader's choice on the next request).
 *
 * Choosing "System" clears the stored preference; choosing "Light" or "Dark"
 * stores it. The select shows "System" while no preference is stored, and
 * the stored theme otherwise.
 *
 * `import { ThemeSelector } from "@canonical/prism-core";`
 */
export default function ThemeSelector(): ReactElement {
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
      aria-label="Color theme"
      onChange={handleChange}
      value={selectValue}
    >
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
