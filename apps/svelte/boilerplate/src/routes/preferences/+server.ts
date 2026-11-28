import { redirect } from "@sveltejs/kit";
import { resolveReturnTo } from "../../resolveReturnTo";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, url }) => {
  const theme = (await request.formData()).get("theme");
  if (theme === "light" || theme === "dark") {
    cookies.set("theme", theme, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: url.protocol === "https:",
      maxAge: 31536000,
    });
  } else {
    cookies.delete("theme", { path: "/" });
  }
  redirect(303, resolveReturnTo(request.headers.get("referer"), url.origin));
};
