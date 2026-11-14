import type { Source } from "@canonical/dataviews-core";
import createMachineSource from "./createMachineSource.js";
import type { Machine } from "./types.js";

/** A source that accepts a request and never answers it. */
export default function createPendingSource(): Source<Machine> {
  return {
    ...createMachineSource(),
    execute: () => () => undefined,
  };
}
