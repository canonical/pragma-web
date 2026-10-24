import { useRouter, useSearchParam } from "@canonical/router-react";
import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_JOURNEY_VIEW,
  JOURNEY_VIEW_PARAM,
} from "../../../constants.js";
import readJourneyView from "../../../readJourneyView.js";
import type { JourneyFilterChoice, JourneyView } from "../../../types.js";
import type { UseProviderStateResult } from "./types.js";

/**
 * Hold the provider's view and the reader's choice of filter. It takes no
 * argument (`UseProviderStateProps` is empty).
 *
 * The view lives in the address, under `JOURNEY_VIEW_PARAM`, so it
 * survives the router remounting the layout on a move from the lens index
 * to a job, and the server and the client read it from the same URL; a
 * change replaces the history entry rather than adding one, and the table,
 * the default, drops the parameter. The filter is React state, starting
 * from no choice, so both sides of hydration agree.
 *
 * @returns The view, the filter and their setters, stable until either
 *   changes.
 * @note Impure: reads the view off the router, writes it to the address,
 *   and holds React state.
 */
export default function useProviderState(): UseProviderStateResult {
  const router = useRouter();
  const view = readJourneyView(useSearchParam(JOURNEY_VIEW_PARAM));
  const setView = useCallback(
    (next: JourneyView) => {
      router.setSearchParams(
        { [JOURNEY_VIEW_PARAM]: next === DEFAULT_JOURNEY_VIEW ? null : next },
        { replace: true },
      );
    },
    [router],
  );
  const [filter, setFilter] = useState<JourneyFilterChoice | undefined>();
  return useMemo(
    () => ({ view, setView, filter, setFilter }),
    [view, setView, filter],
  );
}
