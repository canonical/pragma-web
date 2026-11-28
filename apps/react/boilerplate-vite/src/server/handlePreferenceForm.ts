import { isSupportedLocale } from "@canonical/i18n-core";
import { i18nConfig } from "#i18n/config.js";
import resolveReturnTo from "./resolveReturnTo.js";

/** The cookies' lifetime, in seconds: one year, as the browser writes them. */
const COOKIE_MAX_AGE = 31_536_000;

/** The paths the theme and language forms post to. */
export const PREFERENCE_FORM_PATHS: ReadonlySet<string> = new Set([
  "/preferences",
  "/language",
]);

/** The answer to a preference form: a 303 back, setting a cookie or not. */
export interface PreferenceFormResponse {
  readonly status: 303;
  readonly location: string;
  /** A `Set-Cookie` header value, when the form changes a cookie. */
  readonly setCookie?: string;
}

/** The request facts a preference form's answer depends on. */
export interface PreferenceFormRequest {
  /** The URL's pathname: `/preferences` or `/language`. */
  readonly pathname: string;
  /** The posted, URL-encoded form. */
  readonly form: URLSearchParams;
  /** The `Referer` header, if any. */
  readonly referer: string | null | undefined;
  /** The request's own origin, e.g. `http://localhost:5174`. */
  readonly origin: string;
}

function cookie(name: string, value: string, maxAge: number, secure: boolean) {
  return [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

/**
 * Answers the theme and language forms, which post here when JavaScript is
 * off; with JavaScript the selectors write the same cookies in the browser.
 *
 * `/preferences` stores `theme=light|dark`, or clears the cookie for
 * `system`; `/language` stores a configured `locale`. Both cookies take the
 * options the browser writes them with (`path=/`, `SameSite=Lax`, one year)
 * plus `Secure` over HTTPS, and are not `HttpOnly`, so the page can overwrite
 * them. Either way the reader goes back to a same-origin referer, or home.
 * Any other path is not a preference form, and the answer is `null`.
 */
export default function handlePreferenceForm({
  pathname,
  form,
  referer,
  origin,
}: PreferenceFormRequest): PreferenceFormResponse | null {
  if (!PREFERENCE_FORM_PATHS.has(pathname)) {
    return null;
  }

  const location = resolveReturnTo(referer, origin);
  const secure = origin.startsWith("https:");

  if (pathname === "/preferences") {
    const theme = form.get("theme");

    return {
      status: 303,
      location,
      setCookie:
        theme === "light" || theme === "dark"
          ? cookie("theme", theme, COOKIE_MAX_AGE, secure)
          : cookie("theme", "", 0, secure),
    };
  }

  const locale = form.get("locale");

  return isSupportedLocale(i18nConfig, locale ?? undefined)
    ? {
        status: 303,
        location,
        setCookie: cookie("locale", locale as string, COOKIE_MAX_AGE, secure),
      }
    : { status: 303, location };
}

/**
 * Answers a Fetch API request (`Bun.serve`) that posts a preference form, or
 * resolves `null` for any other request.
 */
export async function respondToPreferenceForm(
  request: Request,
): Promise<Response | null> {
  const url = new URL(request.url);

  if (request.method !== "POST" || !PREFERENCE_FORM_PATHS.has(url.pathname)) {
    return null;
  }

  const answer = handlePreferenceForm({
    pathname: url.pathname,
    form: new URLSearchParams(await request.text()),
    referer: request.headers.get("referer"),
    origin: url.origin,
  });

  if (!answer) return null;

  const headers = new Headers({ location: answer.location });
  if (answer.setCookie) headers.set("set-cookie", answer.setCookie);

  return new Response(null, { status: answer.status, headers });
}
