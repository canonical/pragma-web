import type { I18nConfig, Locale } from "./types.js";

/**
 * Find the configured locale that matches `value` case-insensitively, returned
 * in its original configured casing — so downstream lookups by locale and
 * `<html lang>` always use canonical BCP-47 tags (e.g. `"fr-CA"`).
 *
 * @param config - Active locale configuration.
 * @param value - Candidate tag, or undefined.
 */
export default function findLocale(
  config: I18nConfig,
  value: string | undefined,
): Locale | undefined {
  if (value === undefined) return undefined;
  const lower = value.toLowerCase();
  return config.locales.find((locale) => locale.toLowerCase() === lower);
}
