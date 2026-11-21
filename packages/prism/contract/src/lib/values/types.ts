import type { FacetFilter, FacetSort } from "../lens/index.js";

/**
 * Runs one query against the provider's own schema and answers its data.
 * It rejects when the query reports an error.
 */
export type RunQuery = (
  source: string,
  variables: Readonly<Record<string, unknown>>,
) => Promise<unknown>;

/** The arguments of `Query.facetedInstances` that select the set. */
export interface FacetedInstancesArgs {
  readonly classUri: string;
  readonly filters?: readonly FacetFilter[] | null;
  readonly sort?: FacetSort | null;
}
