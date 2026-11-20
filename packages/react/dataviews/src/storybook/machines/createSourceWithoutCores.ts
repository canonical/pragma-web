import type { Source } from "@canonical/dataviews-core";
import createMachineSource from "./createMachineSource.js";
import type { Machine } from "./types.js";

/**
 * A source that cannot filter or order by cores: its declaration leaves
 * the field out, so no part may offer it, though the collection has it.
 */
export default function createSourceWithoutCores(): Source<Machine> {
  const source = createMachineSource();
  const { cores: _cores, ...filter } = source.capabilities.filter;
  return {
    ...source,
    capabilities: {
      ...source.capabilities,
      filter,
      sort: {
        ...source.capabilities.sort,
        fields: source.capabilities.sort.fields.filter(
          (field) => field !== "cores",
        ),
      },
    },
  };
}
