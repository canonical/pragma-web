import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import createEntitySite, { type EntitySiteLayout } from "./createEntitySite.js";
import createMetroFetch from "./createMetroFetch.js";
import warmRoute from "./warmRoute.js";

/** What a server render of one page hands the client. */
export interface ServerMarkup {
  /** The page's markup. */
  readonly html: string;
  /** The serialised store the markup was rendered from. */
  readonly records: RecordMap;
  /** How many requests the render made once the warm had settled. */
  readonly requestsAfterWarm: number;
}

/**
 * Render `url` the way a site's server does: warm a per-request environment
 * over the metro graph through the matched route's `warm`, serialise its
 * store, then render to a string from a fresh environment seeded with those
 * records whose network always rejects, so a render that misses the store
 * fails rather than reaching the graph.
 *
 * @param url - The page's path.
 * @param layout - The lens layout the page renders in.
 * @returns The markup, the records and the requests the render made.
 * @note Impure: runs the route's warm against the metro graph.
 */
export default async function renderServerMarkup(
  url: string,
  layout: EntitySiteLayout,
): Promise<ServerMarkup> {
  const prepare = createEnvironment({ fetchFn: createMetroFetch() });
  await warmRoute(prepare, url);
  // `toJSON()` returns the untyped JSON shape of the store's records.
  const records = prepare.getStore().getSource().toJSON() as RecordMap;
  let requestsAfterWarm = 0;
  const environment = createEnvironment({
    records,
    fetchFn: () => {
      requestsAfterWarm += 1;
      return Promise.reject(new Error("the server render reached the graph"));
    },
  });
  const html = renderToString(createEntitySite({ url, environment, layout }));
  return { html, records, requestsAfterWarm };
}
