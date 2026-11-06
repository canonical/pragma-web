import type { Direction, I18nConfig, Locale } from "./types.js";

/**
 * Resolve the writing direction for a locale from its base language.
 *
 * @param config - Active locale configuration; its `rtlLocales` list decides.
 * @param locale - Locale tag, e.g. `"ar-EG"`, or undefined.
 */
export default function getDirection(
  config: I18nConfig,
  locale: Locale | undefined,
): Direction {
  if (!locale) return "ltr";
  const lower = locale.toLowerCase();
  const separator = lower.indexOf("-");
  const base = separator === -1 ? lower : lower.slice(0, separator);
  return config.rtlLocales?.includes(base) ? "rtl" : "ltr";
}
