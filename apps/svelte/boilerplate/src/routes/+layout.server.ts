import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals }) => ({
  theme: locals.theme ?? ("system" as const),
  locale: locals.locale,
});
