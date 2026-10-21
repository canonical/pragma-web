import { useFragment, useLazyLoadQuery } from "react-relay";
import type { EntityIndex_query$key } from "../../../__generated__/EntityIndex_query.graphql.js";
import entityIndexFragmentNode from "../../../__generated__/EntityIndex_query.graphql.js";
import type { EntityIndexQuery } from "../../../__generated__/EntityIndexQuery.graphql.js";
import entityIndexQueryNode from "../../../__generated__/EntityIndexQuery.graphql.js";
import buildEntityIndexVariables from "../../buildEntityIndexVariables.js";
import { useEntityFilter } from "../../EntityFilterProvider/index.js";
import matchesEntityText from "../../matchesEntityText.js";
import type {
  UseIndexStripQueryProps,
  UseIndexStripQueryResult,
} from "./types.js";

/**
 * Read what the strip's status states: how many instances the bound class
 * has, and how many of the loaded entries the shared search shows.
 *
 * The strip renders in the layout, beside the routed page, so nothing the
 * index holds can reach it as a prop, and data the index announced could
 * only arrive in an effect: the strip would render empty on the server and
 * populated on the client. So this reads the index's own operation, with
 * the same variables builder, from the store the route's warm filled, then
 * the index's own fragment, so the entries a "Load more" adds count too.
 *
 * @param binding - The binding whose class the index lists.
 * @returns The class's instance count and the number of entries shown.
 * @note Impure: reads the Relay store and the filter context, and suspends
 *   while the store does not hold the operation.
 */
export default function useIndexStripQuery(
  binding: UseIndexStripQueryProps,
): UseIndexStripQueryResult {
  const query = useLazyLoadQuery<EntityIndexQuery>(
    entityIndexQueryNode,
    buildEntityIndexVariables(binding),
  );
  const { ontologyClass } = useFragment<EntityIndex_query$key>(
    entityIndexFragmentNode,
    query,
  );
  const { filter } = useEntityFilter();
  const edges = ontologyClass?.instances.edges ?? [];
  return {
    count: ontologyClass?.instanceCount ?? 0,
    visible: edges.filter(({ node }) =>
      matchesEntityText(filter.text, node._meta),
    ).length,
  };
}
