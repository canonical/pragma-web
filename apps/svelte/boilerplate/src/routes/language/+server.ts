import { isSupportedLocale } from "@canonical/i18n-core";
import { redirect } from "@sveltejs/kit";
import { i18nConfig } from "../../i18n/index.js";
import { resolveReturnTo } from "../../resolveReturnTo.js";
import type { RequestHandler } from "./$types";

/** The `locale` cookie's lifetime, in seconds: one year, as the locale source writes it. */
const LOCALE_COOKIE_MAX_AGE = 31_536_000;

/**
 * The language form's target without JavaScript: it stores a configured
 * locale in the `locale` cookie, then sends the reader back. The cookie is not
 * `httpOnly`: with JavaScript the locale source writes it too, with the same
 * name and options.
 */
export const POST: RequestHandler = async ({ request, cookies, url }) => {
  const locale = (await request.formData()).get("locale");

  if (typeof locale === "string" && isSupportedLocale(i18nConfig, locale)) {
    cookies.set("locale", locale, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: url.protocol === "https:",
      maxAge: LOCALE_COOKIE_MAX_AGE,
    });
  }

  redirect(303, resolveReturnTo(request.headers.get("referer"), url.origin));
};
