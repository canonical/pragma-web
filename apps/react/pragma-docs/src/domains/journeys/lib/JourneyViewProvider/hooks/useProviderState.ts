import { useMemo, useState } from "react";
import { DEFAULT_JOURNEY_VIEW } from "../../../constants.js";
import type { JourneyView } from "../../../types.js";
import type { UseProviderStateResult } from "./types.js";

/**
 * Hold the provider's view, starting from the table. It takes no argument
 * (`UseProviderStateProps` is empty).
 *
 * The initial value is `DEFAULT_JOURNEY_VIEW`, so the server render and the
 * client's first paint are byte-identical. Nothing here may be seeded from
 * `localStorage`, `window` or the query string.
 *
 * @returns The view and its setter, stable until the view changes.
 * @note Impure: holds React state.
 */
export default function useProviderState(): UseProviderStateResult {
  const [view, setView] = useState<JourneyView>(DEFAULT_JOURNEY_VIEW);
  return useMemo(() => ({ view, setView }), [view]);
}
