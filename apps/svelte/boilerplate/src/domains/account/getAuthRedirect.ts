/** The pages that need the demo authentication. */
const protectedPaths = new Set(["/account"]);

/**
 * The login URL to send a request for `url` to, or `null` when it may render.
 * A protected page renders only with `?auth=1`: the demo stands in for real
 * authentication, which a real application checks at the request boundary.
 */
export default function getAuthRedirect(url: URL): string | null {
  if (
    !protectedPaths.has(url.pathname) ||
    url.searchParams.get("auth") === "1"
  ) {
    return null;
  }

  return `/login?from=${encodeURIComponent(url.pathname)}`;
}
