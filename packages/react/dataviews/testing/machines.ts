/**
 * The machine collection the component tests share: the collection, and
 * the declarations a complete local source makes over it. Each helper that
 * builds a machine, a fleet, a declaration or a provider is a file of its
 * own beside this one.
 */

import {
  type CapabilityDeclaration,
  createCollection,
  declareCapabilities,
  type SourceCapabilities,
} from "@canonical/dataviews-core";
import { COUNTED_EXACTLY } from "./fixtures.js";
import type { Machine, MachineFields } from "./types.js";

/** The machine collection every test mounts over. */
export const machines = createCollection({
  identify: (machine: Machine) => machine.id,
  fields: [
    { field: "name", kind: "text" },
    { field: "status", kind: "choices", options: ["failed", "running"] },
    { field: "cores", kind: "number", min: 0 },
  ],
});

/** What every machine declaration shares: its filters, its search and its counts. */
export const MACHINE_DECLARATION = {
  filter: { status: ["isAny"], cores: ["gte", "lte"] },
  search: ["name"],
  counts: COUNTED_EXACTLY,
} as const satisfies CapabilityDeclaration<MachineFields>;

/** What the fixture source declares: it filters, searches and orders by `name` alone. */
export const MACHINE_CAPABILITIES: SourceCapabilities = declareCapabilities(
  machines,
  {
    ...MACHINE_DECLARATION,
    sort: { fields: ["name"], terms: 1, tiebreak: "opaque" },
  },
);
