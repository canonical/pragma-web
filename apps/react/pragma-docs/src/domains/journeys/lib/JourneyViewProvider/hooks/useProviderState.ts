import { useMemo, useState } from "react";
import { DEFAULT_JOURNEY_VIEW } from "../../../constants.js";
import type { JourneyFilterChoice, JourneyView } from "../../../types.js";
import type { UseProviderStateResult } from "./types.js";

/**
 * Hold the provider's view, starting from the table, and the reader's
 * choice of filter, starting from none. It takes no argument
 * (`UseProviderStateProps` is empty).
 *
 * The initial values are constants, so the server render and the client's
 * first paint are byte-identical. Nothing here may be seeded from
 * `localStorage`, `window` or the query string.
 *
 * @returns The view, the filter and their setters, stable until either
 *   changes.
 * @note Impure: holds React state.
 */
export default function useProviderState(): UseProviderStateResult {
  const [view, setView] = useState<JourneyView>(DEFAULT_JOURNEY_VIEW);
  const [filter, setFilter] = useState<JourneyFilterChoice | undefined>();
  return useMemo(() => ({ view, setView, filter, setFilter }), [view, filter]);
}
