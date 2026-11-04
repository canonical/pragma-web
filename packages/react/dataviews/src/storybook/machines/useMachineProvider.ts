import { createDataViewsProvider } from "@canonical/dataviews-core";
import { useState } from "react";
import createMachineSource from "./createMachineSource.js";
import { machineCollection } from "./fixtures.js";
import type { MachineProvider, MachineProviderConfig } from "./types.js";

/**
 * A provider over a real source, built the way an application builds one:
 * once, in state, and handed to the parts. Nothing here subscribes — the
 * parts observe the provider from their effects, and the ref-count starts
 * its ports on the first of them and stops them on the last.
 */
export default function useMachineProvider({
  source = createMachineSource,
  query,
  prepare,
  location,
  views,
  presentation,
  facets,
}: MachineProviderConfig = {}): MachineProvider {
  const [provider] = useState(() => {
    const built = createDataViewsProvider({
      collection: machineCollection,
      source: source(),
      ...(location === undefined ? {} : { location }),
      ...(views === undefined ? {} : { views }),
      ...(presentation === undefined ? {} : { presentation }),
      ...(facets === undefined ? {} : { facets }),
      ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
    });
    prepare?.(built);
    return built;
  });
  return provider;
}
