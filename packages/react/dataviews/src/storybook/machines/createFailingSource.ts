import type { Source } from "@canonical/dataviews-core";
import createMachineSource from "./createMachineSource.js";
import type { Machine } from "./types.js";

/** A source that fails every request: the inventory cannot be reached. */
export default function createFailingSource(): Source<Machine> {
  return {
    ...createMachineSource(),
    execute: (_request, deliver) => {
      deliver({
        status: "failed",
        failure: {
          reason: "the machine inventory could not be reached",
          cause: null,
          transient: null,
        },
      });
      return () => undefined;
    },
  };
}
