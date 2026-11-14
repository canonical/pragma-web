import findLocale from "./findLocale.js";
import type { I18nConfig, Locale } from "./types.js";

/**
 * Match a requested tag to a configured locale: the exact tag first (`fr-CA`),
 * then its base language (`fr`), both case-insensitively. A base language never
 * matches a regional configured tag, so `fr` does not select `fr-CA`.
 *
 * @param config - Active locale configuration.
 * @param tag - Requested BCP 47 tag.
 * @returns The configured locale in its configured casing, or `undefined`.
 */
export default function matchLocale(
  config: I18nConfig,
  tag: string,
): Locale | undefined {
  return findLocale(config, tag) ?? findLocale(config, tag.split("-").at(0));
}
