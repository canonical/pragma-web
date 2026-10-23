import { useMemo, useState } from "react";
import { DEFAULT_LENS_FILTER } from "../../../constants.js";
import type { LensFilterState } from "../../../types.js";
import type { UseProviderStateResult } from "./types.js";

/**
 * Hold the provider's filter, starting from the no-op default, and the
 * region a reader asked the graph to fit, none at first. It takes no
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
 * @returns The filter and the region with their setters, stable until
 *   either changes.
 */
export default function useProviderState(): UseProviderStateResult {
  const [filter, setFilter] = useState<LensFilterState>(DEFAULT_LENS_FILTER);
  const [region, setRegion] = useState<string | undefined>(undefined);
  return useMemo(
    () => ({ filter, setFilter, region, setRegion }),
    [filter, region],
  );
}
