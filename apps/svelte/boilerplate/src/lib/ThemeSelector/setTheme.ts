import { THEME_COOKIE, THEME_COOKIE_MAX_AGE, THEMES } from "./constants.js";
import type { ThemePreference } from "./types.js";

/**
 * Applies a theme preference to the page, as `usePreferredTheme` does in the
 * React app: it swaps the theme class on `<html>` and stores the choice in the
 * theme cookie, so the server renders the same theme on the next request.
 * `system` removes both the class and the cookie, so the styles follow the
 * reader's operating system.
 *
 * @note - This function is impure: it writes `document.documentElement` and
 * `document.cookie`. Call it from an event handler or an effect.
 */
export default function setTheme(preference: ThemePreference): void {
  const { classList } = document.documentElement;

  classList.remove(...THEMES);

  if (preference === "system") {
    // biome-ignore lint/suspicious/noDocumentCookie: the cookie is the preference's store, as in usePreferredTheme
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  classList.add(preference);
  // biome-ignore lint/suspicious/noDocumentCookie: the cookie is the preference's store, as in usePreferredTheme
  document.cookie = `${THEME_COOKIE}=${preference}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}
