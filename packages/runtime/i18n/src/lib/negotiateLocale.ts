import { DEFAULT_COOKIE_NAME } from "./constants.js";
import findLocale from "./findLocale.js";
import matchLocale from "./matchLocale.js";
import parseAcceptLanguage from "./parseAcceptLanguage.js";
import readCookie from "./readCookie.js";
import type { I18nConfig, Locale, LocaleSources } from "./types.js";

/**
 * Pick the first supported locale from a prioritized list of requested tags,
 * matching an exact tag first (`fr-CA`) then its base language (`fr`).
 */
function matchSupported(
  config: I18nConfig,
  requested: readonly string[],
): Locale | undefined {
  for (const tag of requested) {
    const match = matchLocale(config, tag);
    if (match !== undefined) return match;
  }
  return undefined;
}

/**
 * Resolve the locale for an incoming request. An explicit cookie wins, then
 * `Accept-Language` negotiation, then {@link I18nConfig.defaultLocale}. Both
 * inputs are matched case-insensitively. Pure — it takes raw header strings and
 * returns a tag, so it is transport-agnostic and runs the same on server and
 * client (Constitution IV — functional core).
 *
 * @param config - Active locale configuration.
 * @param sources - Raw request headers to negotiate from.
 */
export default function negotiateLocale(
  config: I18nConfig,
  sources: LocaleSources = {},
): Locale {
  const cookie = findLocale(
    config,
    readCookie(sources.cookieHeader, config.cookieName ?? DEFAULT_COOKIE_NAME),
  );
  if (cookie !== undefined) return cookie;

  return (
    matchSupported(config, parseAcceptLanguage(sources.acceptLanguage)) ??
    config.defaultLocale
  );
}
