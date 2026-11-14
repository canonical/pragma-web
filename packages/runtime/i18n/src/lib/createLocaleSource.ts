import { COOKIE_MAX_AGE, DEFAULT_COOKIE_NAME } from "./constants.js";
import getDirection from "./getDirection.js";
import type {
  Direction,
  I18nConfig,
  Locale,
  LocaleSource,
  LocaleSourceOptions,
} from "./types.js";

/**
 * Persist the locale to a cookie. Browser-only; a no-op on the server.
 *
 * @note - This function is impure - it writes `document.cookie` in the browser,
 * so the choice survives a reload and reaches the server's negotiation.
 */
function writeCookie(name: string, value: Locale): void {
  const env = globalThis as { document?: { cookie: string } };
  if (env.document === undefined) return;
  env.document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Reflect the locale onto `<html lang dir>`. Browser-only; a no-op on the server.
 *
 * @note - This function is impure - it writes `<html lang dir>` in the browser,
 * so assistive technology reads the page in the right language and direction.
 */
function reflectDocument(locale: Locale, direction: Direction): void {
  const env = globalThis as {
    document?: { documentElement: { lang: string; dir: string } };
  };
  if (env.document === undefined) return;
  env.document.documentElement.lang = locale;
  env.document.documentElement.dir = direction;
}

/**
 * Create a live, observable locale value — the single cross-framework runtime
 * channel. It holds the current locale, notifies subscribers on change, and (in
 * the browser) persists the choice to a cookie and reflects it onto
 * `<html lang dir>`. On the server those effects are inert, so the same source
 * is safe to construct during SSR.
 *
 * `subscribe` honors the Svelte store contract, so a Svelte component can use
 * `$source` directly, React can pass it to `useSyncExternalStore`, and a Lit
 * reactive controller can subscribe — all from this one object.
 *
 * @param config - Active locale configuration.
 * @param options - Initial locale and effect toggles.
 * @note - This function is impure - in the browser, constructing a source with
 * `reflect` on writes `<html lang dir>`, and its `set` writes the cookie and
 * `<html lang dir>` as `persist` and `reflect` allow, so the page and the next
 * request agree on the locale.
 */
export default function createLocaleSource(
  config: I18nConfig,
  options: LocaleSourceOptions = {},
): LocaleSource {
  const {
    initial = config.defaultLocale,
    persist = true,
    reflect = true,
  } = options;
  const cookieName = config.cookieName ?? DEFAULT_COOKIE_NAME;
  const subscribers = new Set<(locale: Locale) => void>();
  let current = initial;

  // Reflect the initial locale onto `<html lang dir>` immediately (browser only;
  // inert on the server). Without this, a page negotiated to a non-default
  // locale keeps stale `<html lang dir>` until the first locale change — a WCAG
  // 3.1.1 hole and wrong direction for RTL.
  if (reflect) reflectDocument(current, getDirection(config, current));

  return {
    get: () => current,
    get direction(): Direction {
      return getDirection(config, current);
    },
    set(locale) {
      if (locale === current) return;
      current = locale;
      if (persist) writeCookie(cookieName, locale);
      if (reflect) reflectDocument(locale, getDirection(config, locale));
      for (const run of [...subscribers]) run(current);
    },
    subscribe(run) {
      subscribers.add(run);
      run(current);
      return () => {
        subscribers.delete(run);
      };
    },
  };
}
