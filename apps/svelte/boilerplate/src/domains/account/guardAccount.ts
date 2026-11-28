import { redirect } from "@sveltejs/kit";
import getAuthRedirect from "./getAuthRedirect.js";

/**
 * The account route's guard: a request without the demo authentication is
 * redirected to the login page with a 302, on the server and on client-side
 * navigation alike.
 */
export default function guardAccount({ url }: { url: URL }): void {
  const location = getAuthRedirect(url);

  if (location) {
    redirect(302, location);
  }
}
