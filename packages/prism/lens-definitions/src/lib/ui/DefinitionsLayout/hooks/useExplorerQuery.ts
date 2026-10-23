import { useRouterState } from "@canonical/router-react";
import { useLazyLoadQuery } from "react-relay";
import type { DefinitionsExplorerQuery } from "../../../__generated__/DefinitionsExplorerQuery.graphql.js";
import definitionsExplorerQueryNode from "../../../__generated__/DefinitionsExplorerQuery.graphql.js";
import {
  buildDefinitionsExplorerVariables,
  readTermParam,
} from "../../definitionsQuery.js";
import { useLensFilter } from "../../LensFilterProvider/index.js";
import { resolveFilter } from "../../lensFilter.js";
import type { UseStripQueryResult } from "./types.js";

/**
 * Read what the strip's chips and status figure show: the explorer's own
 * operation and the shared filter resolved against the ontologies it returns.
 *
 * The strip renders in the layout, beside the routed page, so nothing the
 * page holds can reach it as a prop, and data the explorer announced could
 * only arrive in an effect: the strip would render empty on the server and
 * populated on the client, a hydration mismatch. So this reads the SAME
 * operation with the SAME variables, the current term read off the route
 * exactly as the page reads it, from the store the route's `warm` filled.
 * The read is a store hit on both sides and no second request exists. It
 * resolves the filter through the same `resolveFilter` the explorer uses, so
 * the chips, the figure and the graph cannot disagree.
 *
 * @note Impure: reads the router, the Relay store and the filter context, and
 *   suspends while the store does not hold the operation.
 * @returns The ontologies, their prefixes, and the resolved filter with its
 *   setter.
 */
export default function useStripQuery(): UseStripQueryResult {
  const { match } = useRouterState();
  const term = readTermParam(
    match?.kind === "route"
      ? (match.params as Readonly<Record<string, unknown>>)
      : {},
  );
  const data = useLazyLoadQuery<DefinitionsExplorerQuery>(
    definitionsExplorerQueryNode,
    buildDefinitionsExplorerVariables(term),
  );
  const { filter, setFilter } = useLensFilter();
  const prefixes = data.ontologies.map((ontology) => ontology.prefix);
  return {
    ontologies: data.ontologies,
    prefixes,
    filter: resolveFilter(filter, prefixes),
    setFilter,
  };
}
