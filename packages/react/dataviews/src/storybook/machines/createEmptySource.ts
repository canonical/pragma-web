import type { Source } from "@canonical/dataviews-core";
import createMachineSource from "./createMachineSource.js";
import type { Machine } from "./types.js";

/** A source whose collection has nothing in it. */
export default function createEmptySource(): Source<Machine> {
  return createMachineSource({ rows: [] });
}
