import type { DefinitionsExplorerQuery } from "../../../__generated__/DefinitionsExplorerQuery.graphql.js";
import type { LensFilter, LensFilterState } from "../../types.js";

/** What `useStripQuery` takes: nothing, since it reads the router, the store
 * and the filter in scope. */
export type UseStripQueryProps = Record<never, never>;

/** What `useStripQuery` returns: the explorer's ontologies, their prefixes, and
 * the shared filter resolved against them, with its setter. */
export interface UseStripQueryResult {
  /** The ontologies the explorer's operation returns, in query order. */
  readonly ontologies: DefinitionsExplorerQuery["response"]["ontologies"];
  /** Each ontology's compact prefix, in query order. */
  readonly prefixes: readonly string[];
  /** The shared filter, resolved against `prefixes` (`resolveFilter`). */
  readonly filter: LensFilter;
  /** Replace the shared filter. */
  readonly setFilter: (next: LensFilterState) => void;
}
