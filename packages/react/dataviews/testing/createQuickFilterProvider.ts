import {
  createArraySource,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import { quickHostCollection, quickHosts } from "./fixtures.js";
import type { QuickFilterProviderConfig, QuickHost } from "./types.js";

/**
 * A provider over the twelve hosts, answered at once by an array source,
 * starting on a query, at a location, and counting the fields asked for
 * beside `zone`, whose options its facet lists.
 *
 * @param config - The query, the location and the counted fields.
 * @returns The provider.
 */
export default function createQuickFilterProvider({
  query,
  location,
  facets = [],
}: QuickFilterProviderConfig = {}) {
  return createDataViewsProvider({
    collection: quickHostCollection,
    source: createArraySource<QuickHost>({
      rows: quickHosts,
      collection: quickHostCollection,
      searchFields: ["name"],
    }),
    // The server's options of `zone` are listed from its facet.
    facets: [...new Set<(typeof facets)[number]>(["zone", ...facets])],
    ...(location === undefined ? {} : { location }),
    ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
  });
}
