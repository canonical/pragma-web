import {
  createArraySource,
  createDataViewsProvider,
  createMemoryLocation,
} from "@canonical/dataviews-core";
import buildFleet from "./buildFleet.js";
import { CHART_FACETS } from "./constants.js";
import { machines } from "./machines.js";
import type { FacetedFleetConfig, MachineProvider } from "./types.js";

/**
 * A provider over a fleet in the local array source, which counts and
 * measures every field it facets and answers within the call: what a chart
 * reads its facets from.
 */
export default function createFacetedFleet({
  count = 12,
  href,
  query,
  facets = CHART_FACETS,
}: FacetedFleetConfig = {}): MachineProvider {
  return createDataViewsProvider({
    collection: machines,
    source: createArraySource({
      rows: buildFleet(count),
      collection: machines,
    }),
    facets,
    ...(href === undefined ? {} : { location: createMemoryLocation({ href }) }),
    ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
  });
}
