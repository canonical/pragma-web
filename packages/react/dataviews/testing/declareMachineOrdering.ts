import {
  declareCapabilities,
  type SortTerm,
  type SourceCapabilities,
} from "@canonical/dataviews-core";
import { MACHINE_DECLARATION, machines } from "./machines.js";

/**
 * A declaration ordering by all three machine fields, with the given term
 * limit and default: what a header test sorts several columns over.
 */
export default function declareMachineOrdering(
  terms: number | null,
  defaultSort: readonly SortTerm[] = [],
): SourceCapabilities {
  return declareCapabilities(machines, {
    ...MACHINE_DECLARATION,
    sort: {
      fields: ["name", "status", "cores"],
      terms,
      tiebreak: "opaque",
      default: defaultSort,
    },
  });
}
