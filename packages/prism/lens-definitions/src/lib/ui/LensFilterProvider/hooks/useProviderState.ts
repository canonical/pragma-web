import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeFilterText } from "../../../lensFilter.js";
import type { LensFilterState } from "../../../types.js";
import type { ExplorerChoices } from "../types.js";
import type { UseProviderStateResult } from "./types.js";
import useExplorerSession from "./useExplorerSession.js";

/**
 * Hold the provider's filter, the search box's text and the latest request
 * to fit the graph to a region, each request numbered one past the last,
 * starting from the session the router in scope keeps and writing every
 * change back to it, so the layout the router mounts again on another of
 * the lens's routes starts where the reader left it; with the session's
 * memory of the graph's camera. It takes no argument
 * (`UseProviderStateProps` is empty).
 *
 * A fresh router's session holds `DEFAULT_LENS_FILTER`, which carries no
 * `namespaces`: every consumer reads it as "no chip has been touched, so
 * show everything", so the server render and the client's first paint are
 * byte-identical. Nothing here may be seeded from `localStorage`, `window`
 * or the query string.
 *
 * @note Impure: holds the choices in React state and writes them to the
 *   router's session once they commit.
 * @returns The filter, the search and the region request with their
 *   setters, and the camera's memory, stable until a choice changes.
 */
export default function useProviderState(): UseProviderStateResult {
  const session = useExplorerSession();
  const [choices, setChoices] = useState<ExplorerChoices>(
    session.choices.current,
  );
  useEffect(() => {
    session.choices.current = choices;
  }, [choices, session]);
  const setFilter = useCallback((filter: LensFilterState): void => {
    setChoices((last) => ({ ...last, filter }));
  }, []);
  const setSearch = useCallback((search: string): void => {
    setChoices((last) => ({
      ...last,
      search,
      filter: { ...last.filter, text: normalizeFilterText(search) },
    }));
  }, []);
  const requestRegion = useCallback((prefix: string): void => {
    setChoices((last) => ({
      ...last,
      region: { prefix, serial: (last.region?.serial ?? 0) + 1 },
    }));
  }, []);
  return useMemo(
    () => ({
      filter: choices.filter,
      setFilter,
      search: choices.search,
      setSearch,
      region: choices.region,
      requestRegion,
      camera: session.camera,
    }),
    [choices, requestRegion, session, setFilter, setSearch],
  );
}
