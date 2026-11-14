import { createDataViewsProvider } from "@canonical/dataviews-core";
import { CHART_FACETS } from "./constants.js";
import createManualSource from "./createManualSource.js";
import { MACHINE_CAPABILITIES, machines } from "./machines.js";
import type { Machine, MachineProvider, ManualSource } from "./types.js";

/**
 * A provider over a manual source that declares the status and cores facets,
 * and asks for both: a test answers each request by hand, with whatever
 * counts and ranges it needs.
 */
export default function createFacetedManual(): {
  readonly provider: MachineProvider;
  readonly source: ManualSource<Machine>;
} {
  const source = createManualSource<Machine>({
    capabilities: { ...MACHINE_CAPABILITIES, facets: CHART_FACETS },
  });
  const provider = createDataViewsProvider({
    collection: machines,
    source: source.source,
    facets: CHART_FACETS,
  });
  return { provider, source };
}
