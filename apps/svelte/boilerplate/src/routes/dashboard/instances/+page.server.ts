import { fetchOptions } from "@canonical/svelte-ds-global-form";
import { fail, redirect } from "@sveltejs/kit";
import { isNameTaken, readInstances, releases, validInstance } from "../../../domains/dashboard/instances";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, url, fetch }) => {
  const instances = readInstances(cookies.get("demo-instances"));
  const selected = instances.find((instance) => instance.name === url.searchParams.get("selected"));
  const requestedRelease = url.searchParams.get("release");
  const release = releases.find((item) => item === requestedRelease) ?? "noble";
  // Kit's `fetch` calls the endpoint in-process, so the options render on the server.
  const releaseOptions = await fetchOptions("/api/releases", { fetch });
  return { instances, selected, create: url.searchParams.get("create") === "1", release, releaseOptions };
};

export const actions: Actions = {
  create: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const rawName = data.get("name");
    const rawRelease = data.get("release");
    const rawCloud = data.get("cloudInit");
    const values = { name: typeof rawName === "string" ? rawName : "", release: typeof rawRelease === "string" ? rawRelease : "", pro: data.get("pro") === "on", cloudInit: typeof rawCloud === "string" ? rawCloud : "" };
    const instances = readInstances(cookies.get("demo-instances"));
    if (!validInstance(values)) return fail(400, { values, issue: "instanceInvalid" });
    if (isNameTaken(values.name, instances)) return fail(400, { values, issue: "instanceDuplicate" });
    if (instances.length >= 10) return fail(400, { values, issue: "instanceLimit" });
    const payload = JSON.stringify([...instances, values]);
    if (encodeURIComponent(payload).length > 3000) return fail(400, { values, issue: "instanceLimit" });
    cookies.set("demo-instances", payload, { path: "/", sameSite: "lax", httpOnly: true, secure: url.protocol === "https:", maxAge: 86400 });
    redirect(303, `/dashboard/instances?selected=${encodeURIComponent(values.name)}`);
  },
};
