import { getDocumentAttributes, negotiateLocale } from "@canonical/i18n-core";
import type { Handle } from "@sveltejs/kit";
import { config } from "./i18n";

export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme");
  event.locals.theme = theme === "light" || theme === "dark" ? theme : "";
  event.locals.locale = negotiateLocale(config, {
    cookieHeader: event.request.headers.get("cookie"),
    acceptLanguage: event.request.headers.get("accept-language"),
  });
  const { lang, dir } = getDocumentAttributes(config, event.locals.locale);

  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html
        .replace("%theme%", event.locals.theme)
        .replace("%lang%", lang)
        .replace("%dir%", dir),
  });
  if (response.headers.get("content-type")?.includes("text/html")) {
    response.headers.set("cache-control", "private, no-store");
  }
  return response;
};
