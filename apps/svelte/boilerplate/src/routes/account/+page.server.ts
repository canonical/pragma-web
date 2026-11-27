import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

function authorize(url: URL, session: string | undefined) {
  if (url.searchParams.get("auth") !== "1" && session !== "yes") redirect(302, "/login?from=%2Faccount");
}

export const load: PageServerLoad = ({ url, cookies }) => {
  authorize(url, cookies.get("demo-session"));
};

export const actions: Actions = {
  default: ({ cookies, url }) => {
    authorize(url, cookies.get("demo-session"));
    cookies.set("demo-session", "yes", { path: "/", httpOnly: true, sameSite: "lax", secure: url.protocol === "https:" });
    redirect(303, "/dashboard");
  },
};
