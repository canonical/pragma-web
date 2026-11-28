import { negotiateLocale } from "@canonical/i18n-core";
import { i18nConfig } from "../../i18n/index.js";
import readTheme from "../../lib/ThemeSelector/readTheme.js";
import type { LayoutLoad } from "./$types";

// The client-only build: every route renders in the browser, from the static
// host's fallback page.
export const ssr = false;
export const prerender = false;

/**
 * Without a server, the browser reads what the SSR build's hooks read: the
 * theme from the `theme` cookie, and the locale from the `locale` cookie, then
 * the browser's languages (its stand-in for Accept-Language).
 */
export const load: LayoutLoad = () => ({
  theme: readTheme(document.cookie) ?? ("system" as const),
  locale: negotiateLocale(i18nConfig, {
    cookieHeader: document.cookie,
    acceptLanguage: navigator.languages?.join(",") ?? navigator.language,
  }),
});
