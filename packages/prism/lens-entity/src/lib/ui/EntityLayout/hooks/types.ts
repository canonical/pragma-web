import type { EntityBinding } from "@canonical/prism-core";

/** What `useIndexStripQuery` takes: the binding whose index it reads. */
export type UseIndexStripQueryProps = EntityBinding;

/** What `useIndexStripQuery` returns: the strip's two figures. */
export interface UseIndexStripQueryResult {
  /** How many instances the class has, loaded or not; 0 when the graph does
   * not know the class. */
  readonly count: number;
  /** How many loaded entries the search shows. */
  readonly visible: number;
}
