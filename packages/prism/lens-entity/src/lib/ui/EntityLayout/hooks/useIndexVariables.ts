import type { EntityBinding } from "@canonical/prism-core";
import { useSearchParams } from "@canonical/router-react";
import { useLazyLoadQuery } from "react-relay";
import type { EntityFacetScopeQuery } from "../../../../__generated__/EntityFacetScopeQuery.graphql.js";
import entityFacetScopeQueryNode from "../../../../__generated__/EntityFacetScopeQuery.graphql.js";
import type { EntityIndexQuery$variables } from "../../../../__generated__/EntityIndexQuery.graphql.js";
import buildEntityIndexVariables from "../../../buildEntityIndexVariables.js";
import readFacetParams from "../../../readFacetParams.js";
import selectFacetParams from "../../../selectFacetParams.js";

/**
 * The index operation's variables for the current address: the binding's
 * class and the facet filters the address applies. The filters' names and
 * curies need the class's facets and the graph's prefixes, which the facet
 * scope holds; an address with no candidate parameter reads the scope from
 * the store only, so an unfiltered index makes no request for it.
 *
 * @param binding - The binding whose class the index lists.
 * @returns The variables the index, the strip and the warm share.
 * @note Impure: reads the router's address and the Relay store, and
 *   suspends while a filtered address's scope is not in it.
 */
export default function useIndexVariables(
  binding: EntityBinding,
): EntityIndexQuery$variables {
  const search = Object.fromEntries(useSearchParams());
  const names = selectFacetParams(search);
  const scope = useLazyLoadQuery<EntityFacetScopeQuery>(
    entityFacetScopeQueryNode,
    { classId: binding.classUri },
    { fetchPolicy: names.length === 0 ? "store-only" : "store-or-network" },
  );
  if (names.length === 0) return buildEntityIndexVariables(binding);
  const facets = new Set(
    scope.facetedInstances?.facets.map(({ field }) => field) ?? [],
  );
  return buildEntityIndexVariables(
    binding,
    readFacetParams(
      search,
      names.filter((name) => facets.has(name)),
      scope.ontologies ?? [],
    ),
  );
}
