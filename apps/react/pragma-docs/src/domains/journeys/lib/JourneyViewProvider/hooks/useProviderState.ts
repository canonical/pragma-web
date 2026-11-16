import { useSearchParam } from "@canonical/router-react";
import { useMemo, useState } from "react";
import { JOURNEY_VIEW_PARAM } from "../../../constants.js";
import readJourneyView from "../../../readJourneyView.js";
import type { JourneyFilterChoice } from "../../../types.js";
import type { UseProviderStateResult } from "./types.js";

/**
 * Hold the provider's view and the reader's choice of filter. It takes no
 * argument (`UseProviderStateProps` is empty).
 *
 * The view lives in the address, under `JOURNEY_VIEW_PARAM`, so it
 * survives the router remounting the layout on a move from the lens index
 * to a job, and the server and the client read it from the same URL; the
 * strip's links change it, and the table, the default, has no parameter.
 * The filter is React state, starting from no choice, so both sides of
 * hydration agree.
 *
 * @returns The view, the filter and its setter, stable until either
 *   changes.
 * @note Impure: reads the view off the router and holds React state.
 */
export default function useProviderState(): UseProviderStateResult {
  const view = readJourneyView(useSearchParam(JOURNEY_VIEW_PARAM));
  const [filter, setFilter] = useState<JourneyFilterChoice | undefined>();
  return useMemo(() => ({ view, filter, setFilter }), [view, filter]);
}
