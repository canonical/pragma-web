import {
  type EntityBinding,
  getPrefetchEnvironment,
  prefetchQuery,
} from "@canonical/prism-core";
import { fetchQuery } from "relay-runtime";
import type { EntityFacetScopeQuery } from "../__generated__/EntityFacetScopeQuery.graphql.js";
import entityFacetScopeQueryNode from "../__generated__/EntityFacetScopeQuery.graphql.js";
import type { EntityIndexQuery } from "../__generated__/EntityIndexQuery.graphql.js";
import entityIndexQueryNode from "../__generated__/EntityIndexQuery.graphql.js";
import buildEntityIndexVariables from "./buildEntityIndexVariables.js";
import { STORE_OR_NETWORK } from "./constants.js";
import readFacetParams from "./readFacetParams.js";
import selectFacetParams from "./selectFacetParams.js";

/**
 * Warm the store for a binding's index. An address without a facet
 * parameter prefetches the index's one operation. A filtered address takes
 * two steps, as the entity page does: the facet scope (the class's facets
 * and the graph's prefixes), then the index with the filters the scope
 * reads off the address, both through the environment read once. A scope
 * that answers nothing warms nothing more: the filters cannot be read.
 *
 * @param binding - The binding whose class the index lists.
 * @param search - The matched search, carrying the facet parameters.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: reads the published prefetch environment and fetches into
 *   it, one request unfiltered, two filtered.
 */
export default function warmEntityIndex(
  binding: EntityBinding,
  search: object = {},
): Promise<void> {
  const names = selectFacetParams(search);
  if (names.length === 0) {
    return prefetchQuery(
      entityIndexQueryNode,
      buildEntityIndexVariables(binding),
    );
  }
  const environment = getPrefetchEnvironment();
  if (environment === undefined) return Promise.resolve();
  return fetchQuery<EntityFacetScopeQuery>(
    environment,
    entityFacetScopeQueryNode,
    { classId: binding.classUri },
    STORE_OR_NETWORK,
  )
    .toPromise()
    .then((scope) => {
      if (scope === undefined) return undefined;
      const facets = new Set(
        scope.facetedInstances.facets.map(({ field }) => field),
      );
      return fetchQuery<EntityIndexQuery>(
        environment,
        entityIndexQueryNode,
        buildEntityIndexVariables(
          binding,
          readFacetParams(
            search,
            names.filter((name) => facets.has(name)),
            scope.ontologies,
          ),
        ),
        STORE_OR_NETWORK,
      ).toPromise();
    })
    .then(() => undefined);
}
