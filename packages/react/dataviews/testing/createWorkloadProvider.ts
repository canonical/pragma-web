import {
  createArraySource,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import { workloadCollection } from "../src/storybook/workloads/index.js";
import { WORKLOAD_RECORDS } from "./fixtures.js";
import type { Workload } from "./types.js";

/**
 * A provider over the workload collection, and the local source answering
 * it, whose rows a test replaces with `source.setRows` and a refresh.
 *
 * @param rows The workloads the source holds; one of each type by default.
 * @returns The provider, not yet observed, and its source.
 */
export default function createWorkloadProvider(
  rows: readonly Workload[] = WORKLOAD_RECORDS,
) {
  const source = createArraySource({ rows, collection: workloadCollection });
  const provider = createDataViewsProvider({
    collection: workloadCollection,
    source,
  });
  return { provider, source };
}
