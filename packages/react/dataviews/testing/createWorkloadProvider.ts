import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import type { Workload } from "./types.js";

/** Workloads discriminated by type, `host` applying to containers alone. */
const workloads = createCollection({
  identify: (row: Workload) => row.id,
  fields: [
    { field: "type", kind: "choices", options: ["container", "vm"] },
    { field: "host", kind: "text", appliesTo: ["container"] },
  ],
  discriminator: "type",
});

/**
 * A provider over the workload collection, answered from `rows`.
 *
 * @param rows The workloads the source holds.
 * @returns The provider, not yet observed.
 */
export default function createWorkloadProvider(rows: readonly Workload[]) {
  return createDataViewsProvider({
    collection: workloads,
    source: createArraySource({ rows, collection: workloads }),
  });
}
