import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ url }) => {
  return { project: (url.searchParams.get("project") ?? "").slice(0, 100) };
};
