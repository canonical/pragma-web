import { redirect } from "@sveltejs/kit";

// The legacy home URL: the SSR build answers with a real 301; without a
// server the client redirects.
export const load = () => redirect(301, "/");
