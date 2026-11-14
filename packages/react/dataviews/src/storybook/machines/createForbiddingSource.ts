import type { Source } from "@canonical/dataviews-core";
import createMachineSource from "./createMachineSource.js";
import type { Machine } from "./types.js";

/** A machine source that answers every request as forbidden to the reader. */
export default function createForbiddingSource(): Source<Machine> {
  return {
    ...createMachineSource(),
    execute: (_request, deliver) => {
      deliver({ status: "forbidden", cause: null });
      return () => undefined;
    },
  };
}
