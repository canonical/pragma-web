import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: ({ cookies, url }) => {
    cookies.set("demo-session", "yes", { path: "/", httpOnly: true, sameSite: "lax", secure: url.protocol === "https:" });
    redirect(303, "/account");
  },
};
