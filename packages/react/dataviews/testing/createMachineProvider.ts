import { createDataViewsProvider } from "@canonical/dataviews-core";
import createManualSource from "./createManualSource.js";
import { MACHINE_CAPABILITIES, machines } from "./machines.js";
import pageOf from "./pageOf.js";
import type {
  Machine,
  MachineFixture,
  MachineProviderConfig,
} from "./types.js";

/**
 * A provider over the machine collection and a manual source. Given `rows`,
 * every request is answered at once with them; otherwise the test delivers
 * through `source.latest().deliver(...)` after the component's effect has
 * observed the provider.
 */
export default function createMachineProvider({
  rows,
  capabilities = MACHINE_CAPABILITIES,
  location,
  views,
  presentation,
  snapshot,
  ...rest
}: MachineProviderConfig = {}): MachineFixture {
  const source = createManualSource<Machine>({
    ...rest,
    capabilities,
    ...(rows === undefined ? {} : { answer: () => pageOf(rows) }),
  });
  const provider = createDataViewsProvider({
    collection: machines,
    source: source.source,
    ...(location === undefined ? {} : { location }),
    ...(views === undefined ? {} : { views }),
    ...(presentation === undefined ? {} : { presentation }),
    ...(snapshot === undefined ? {} : { snapshot }),
  });
  return { provider, collection: machines, source };
}
