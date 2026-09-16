/**
 * The provider the polymorphic stories render over, built as the machine
 * stories build theirs. Story-only.
 */

import {
  createDataViewsProvider,
  type DataViewsProvider,
  type Source,
} from "@canonical/dataviews-core";
import { useState } from "react";
import {
  createInstanceSource,
  type Instance,
  type InstanceFields,
  instanceCollection,
} from "./fixtures.js";

type InstanceProvider = DataViewsProvider<InstanceFields, Instance>;

/** How one story's instance provider is set up. Read once, when it mounts. */
export type InstanceProviderConfig = {
  /** The source, built once for the story; the instances over an array by default. */
  readonly source?: (() => Source<Instance>) | undefined;
  /** The query the provider starts on, as the canonical text a snapshot carries. */
  readonly query?: string | undefined;
  /** Commands issued once the provider is built, before anything observes it. */
  readonly prepare?: ((provider: InstanceProvider) => void) | undefined;
};

/**
 * A provider over the instance collection, built once for the story; the
 * parts observe it, as they do the machines'.
 */
export function useInstanceProvider({
  source = createInstanceSource,
  query,
  prepare,
}: InstanceProviderConfig = {}): InstanceProvider {
  const [provider] = useState(() => {
    const built = createDataViewsProvider({
      collection: instanceCollection,
      source: source(),
      ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
    });
    prepare?.(built);
    return built;
  });
  return provider;
}
