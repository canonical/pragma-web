import { getDocumentAttributes, negotiateLocale } from "@canonical/i18n-core";
import type { Handle } from "@sveltejs/kit";
import { i18nConfig } from "./i18n/index.js";
import readTheme from "./lib/ThemeSelector/readTheme.js";

/**
 * Reads the request's theme and locale, and writes them into the document's
 * `<html>` before first paint: the theme class, `lang` and `dir`. HTML is
 * private and not stored, because both depend on the request's cookies.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const cookieHeader = event.request.headers.get("cookie");

  event.locals.theme = readTheme(cookieHeader);
  event.locals.locale = negotiateLocale(i18nConfig, {
    cookieHeader,
    acceptLanguage: event.request.headers.get("accept-language"),
  });
  const { lang, dir } = getDocumentAttributes(i18nConfig, event.locals.locale);

  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html
        .replace("%theme%", event.locals.theme ? ` ${event.locals.theme}` : "")
        .replace("%lang%", lang)
        .replace("%dir%", dir),
  });
  if (response.headers.get("content-type")?.includes("text/html")) {
    response.headers.set("cache-control", "private, no-store");
  }
  return response;
};
