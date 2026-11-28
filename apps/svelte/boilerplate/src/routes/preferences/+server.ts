import { redirect } from "@sveltejs/kit";
import {
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  THEMES,
} from "../../lib/ThemeSelector/constants.js";
import { resolveReturnTo } from "../../resolveReturnTo.js";
import type { RequestHandler } from "./$types";

/**
 * The theme form's target without JavaScript: it stores a pinned theme in the
 * `theme` cookie, or clears the cookie for `system`, then sends the reader
 * back. The cookie is not `httpOnly`: with JavaScript the page writes it too,
 * with the same name and options, as `setTheme` does.
 */
export const POST: RequestHandler = async ({ request, cookies, url }) => {
  const theme = (await request.formData()).get("theme");

  if (THEMES.some((value) => value === theme)) {
    cookies.set(THEME_COOKIE, String(theme), {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: url.protocol === "https:",
      maxAge: THEME_COOKIE_MAX_AGE,
    });
  } else {
    cookies.delete(THEME_COOKIE, { path: "/", httpOnly: false });
  }

  redirect(303, resolveReturnTo(request.headers.get("referer"), url.origin));
};
