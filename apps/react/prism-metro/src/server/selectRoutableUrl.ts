import { notFoundRoute } from "../routes.js";

/**
 * The URL the server routes a request by: the request's own, or the
 * not-found page's when its path's percent-encoding does not decode.
 *
 * The router decodes each path segment while it matches, so a malformed
 * sequence such as `/stations/%ZZ` throws a `URIError` out of the match
 * instead of failing to match. Such a path names no resource, so the server
 * answers it as it answers every URL no route matches: the not-found page,
 * at 404. The query string is left alone; the router does not decode it
 * while matching.
 *
 * @param url - The request's path and query string.
 * @returns The URL to hand the router.
 */
export default function selectRoutableUrl(url: string): string {
  return decodePath(url) === undefined ? notFoundRoute.url : url;
}

/**
 * Decode the path of `url`, or return `undefined` when its percent-encoding
 * does not decode.
 *
 * The decoded path is returned rather than discarded: the bundler treats
 * `decodeURIComponent` as free of side effects and drops a call whose result
 * goes unused, and the throw this check relies on with it.
 *
 * @param url - The request's path and query string.
 * @returns The decoded path, or `undefined`.
 */
function decodePath(url: string): string | undefined {
  try {
    return decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return undefined;
  }
}
