import { readCookie } from "@canonical/i18n-core";
import { THEME_COOKIE, THEMES } from "./constants.js";
import type { Theme } from "./types.js";

/**
 * Reads the pinned theme from a raw `Cookie` header, or `undefined` when the
 * cookie is absent or holds anything but a pinned theme.
 */
export default function readTheme(
  cookieHeader: string | null | undefined,
): Theme | undefined {
  const value = readCookie(cookieHeader, THEME_COOKIE);

  return THEMES.find((theme) => theme === value);
}
