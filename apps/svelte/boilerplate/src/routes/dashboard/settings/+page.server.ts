import { fail } from "@sveltejs/kit";
import { readSettings, validMaximum } from "../../../domains/dashboard/settings";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies }) => {
  return { settings: readSettings(cookies.get("demo-settings")) };
};

export const actions: Actions = {
  default: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const text = (name: string) => { const value = data.get(name); return typeof value === "string" ? value : ""; };
    const values = { name: text("name").trim(), bridge: text("bridge"), ipv6: data.has("ipv6"), snapshots: data.has("snapshots"), maxInstances: text("maxInstances") };
    const errors = {
      ...(!values.name || values.name.length > 60 ? { name: values.name.length > 60 ? "nameTooLong" : "nameError" } : {}),
      ...(!["lxdbr0", "ovn-1"].includes(values.bridge) ? { bridge: "bridgeError" } : {}),
      ...(!validMaximum(values.maxInstances) ? { maxInstances: "maximumError" } : {}),
    };
    if (Object.keys(errors).length) return fail(400, { values, errors });
    cookies.set("demo-settings", JSON.stringify(values), { path: "/", sameSite: "lax", httpOnly: true, secure: url.protocol === "https:", maxAge: 31536000 });
    return { values, saved: true };
  },
};
