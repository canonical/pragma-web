import { redirect } from "@sveltejs/kit";
import { config } from "../../i18n";
import { returnTo } from "../../returnTo";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, url }) => {
  const locale = (await request.formData()).get("locale");
  if (typeof locale === "string" && config.locales.includes(locale)) {
    cookies.set("locale", locale, { path: "/", sameSite: "lax", secure: url.protocol === "https:", maxAge: 31536000 });
  }
  redirect(303, returnTo(request.headers.get("referer"), url.origin));
};
