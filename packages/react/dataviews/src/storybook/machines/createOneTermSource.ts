import type { Source } from "@canonical/dataviews-core";
import createMachineSource from "./createMachineSource.js";
import type { Machine } from "./types.js";

/**
 * A source that orders by one term at a time: a further term is refused, and
 * the heading that asked for it says why.
 */
export default function createOneTermSource(): Source<Machine> {
  const source = createMachineSource();
  return {
    ...source,
    capabilities: {
      ...source.capabilities,
      sort: { ...source.capabilities.sort, terms: 1 },
    },
  };
}
