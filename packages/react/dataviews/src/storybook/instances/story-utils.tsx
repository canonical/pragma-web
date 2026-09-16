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

export type InstanceProvider = DataViewsProvider<InstanceFields, Instance>;

export type InstanceProviderConfig = {
  readonly source?: (() => Source<Instance>) | undefined;
  readonly query?: string | undefined;
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
