import type { FacetCount, FacetFilter } from "@canonical/prism-contract";
import type { EntityBinding } from "@canonical/prism-core";
import type { OntologyNamespace } from "../../../types.js";

/** What `useIndexStripQuery` takes: the binding whose index it reads. */
export type UseIndexStripQueryProps = EntityBinding;

/** What `useIndexStripQuery` returns: the strip's two figures. */
export interface UseIndexStripQueryResult {
  /** How many instances the class has, loaded or not; 0 when the graph does
   * not know the class. */
  readonly count: number;
  /** How many loaded entries the search shows. */
  readonly visible: number;
  /** The total the shown entries are counted against: the class's
   * instances, or the matching set's where a facet filter applies. */
  readonly total: number;
  /** The class's facets, each value counted over the matching set. */
  readonly facets: readonly FacetCount[];
  /** The facet filters the address applies, values as IRIs. */
  readonly applied: readonly FacetFilter[];
  /** The graph's prefixes, which write the facets' values as curies. */
  readonly namespaces: readonly OntologyNamespace[];
}
