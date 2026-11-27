import { error, redirect } from "@sveltejs/kit";
import { readInstances } from "../../../../domains/dashboard/instances";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url, cookies }) => {
  const instance = readInstances(cookies.get("demo-instances")).find((item) => item.name === url.searchParams.get("name"));
  if (!instance) error(404, "Instance not found");
  return { instance };
};
export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const name = (await request.formData()).get("name");
    const instances = readInstances(cookies.get("demo-instances"));
    if (typeof name !== "string" || !instances.some((item) => item.name === name)) error(404, "Instance not found");
    cookies.set("demo-instances", JSON.stringify(instances.filter((item) => item.name !== name)), { path: "/", sameSite: "lax", httpOnly: true, secure: url.protocol === "https:", maxAge: 86400 });
    redirect(303, "/dashboard/instances");
  },
};
