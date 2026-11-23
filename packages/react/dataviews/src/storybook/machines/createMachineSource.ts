import { createArraySource, type Source } from "@canonical/dataviews-core";
import { machineCollection, storyMachines } from "./fixtures.js";
import type { Machine, MachineSourceConfig } from "./types.js";

/** A local-array source over the machines, or over a caller's own rows. */
export default function createMachineSource({
  rows = storyMachines,
  defaultSort,
}: MachineSourceConfig = {}): Source<Machine> {
  return createArraySource<Machine>({
    rows,
    collection: machineCollection,
    searchFields: ["name", "owner"],
    ...(defaultSort === undefined ? {} : { defaultSort }),
  });
}
