import type { JourneysExplorerQuery } from "#relay/__generated__/JourneysExplorerQuery.graphql.js";

/** What `useJourneysQuery` takes: nothing, since it reads the router and
 * the store in scope. */
export type UseJourneysQueryProps = Record<never, never>;

/** What `useJourneysQuery` returns: the route's job and the operation. */
export interface UseJourneysQueryResult {
  /** The selected job's URI, or undefined on the lens index. */
  readonly job: string | undefined;
  /** The explorer's operation, as the warm store holds it. */
  readonly data: JourneysExplorerQuery["response"];
}
