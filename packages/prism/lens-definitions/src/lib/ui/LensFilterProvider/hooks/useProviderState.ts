import { useCallback, useMemo, useState } from "react";
import { DEFAULT_LENS_FILTER } from "../../../constants.js";
import type { LensFilterState, RegionRequest } from "../../../types.js";
import type { UseProviderStateResult } from "./types.js";

/**
 * Hold the provider's filter, starting from the no-op default, and the
 * latest request to fit the graph to a region, none at first; each request
 * numbers itself one past the last. It takes no
 * argument (`UseProviderStateProps` is empty).
 *
 * The initial value is `DEFAULT_LENS_FILTER`, which carries no `namespaces`:
 * every consumer reads it as "no chip has been touched, so show everything",
 * so the server render and the client's first paint are byte-identical.
 * Nothing here may be seeded from `localStorage`, `window` or the query
 * string.
 *
 * @note Impure: holds the filter in React state, so the value it returns
 *   changes across renders once `setFilter` is called.
 * @returns The filter and the region request with their setters, stable
 *   until either changes.
 */
export default function useProviderState(): UseProviderStateResult {
  const [filter, setFilter] = useState<LensFilterState>(DEFAULT_LENS_FILTER);
  const [region, setRegion] = useState<RegionRequest | undefined>(undefined);
  const requestRegion = useCallback((prefix: string): void => {
    setRegion((last) => ({ prefix, serial: (last?.serial ?? 0) + 1 }));
  }, []);
  return useMemo(
    () => ({ filter, setFilter, region, requestRegion }),
    [filter, region, requestRegion],
  );
}
