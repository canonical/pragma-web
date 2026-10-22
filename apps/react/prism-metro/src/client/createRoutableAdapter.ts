import type { PlatformAdapter } from "@canonical/router-core";
import selectRoutableUrl from "../selectRoutableUrl.js";

/**
 * Wrap a platform adapter so the router reads every location through
 * `selectRoutableUrl`: a location whose path does not percent-decode reaches
 * the router as the not-found page's URL, as it does on the server.
 *
 * Without it the browser router's first match throws a `URIError` on the
 * not-found document the server answered such a path with, and the page
 * never hydrates. The address bar keeps the location the reader asked for;
 * only the router's view of it changes. Navigation and load tracking pass
 * through untouched.
 *
 * @param adapter - The adapter that reads and writes the real location.
 * @returns An adapter reporting routable locations.
 */
export default function createRoutableAdapter(
  adapter: PlatformAdapter,
): PlatformAdapter {
  return {
    ...adapter,
    getLocation: () => selectRoutableUrl(String(adapter.getLocation())),
    subscribe: (callback) =>
      adapter.subscribe((location) =>
        callback(selectRoutableUrl(String(location))),
      ),
  };
}
