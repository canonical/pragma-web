import { useMemo, useState } from "react";
import { DEFAULT_ENTITY_FILTER } from "../../constants.js";
import type { EntityFilter } from "../../types.js";
import type { UseProviderStateResult } from "./types.js";

/**
 * Hold the provider's filter, starting from the no-op default. It takes no
 * argument (`UseProviderStateProps` is empty).
 *
 * The initial value is `DEFAULT_ENTITY_FILTER`, so the server render and the
 * client's first paint are byte-identical. Nothing here may be seeded from
 * `localStorage`, `window` or the query string.
 *
 * @returns The filter and its setter, stable until the filter changes.
 * @note Impure: holds React state.
 */
export default function useProviderState(): UseProviderStateResult {
  const [filter, setFilter] = useState<EntityFilter>(DEFAULT_ENTITY_FILTER);
  return useMemo(() => ({ filter, setFilter }), [filter]);
}
