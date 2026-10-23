import { useRouterState } from "@canonical/router-react";
import { useLazyLoadQuery } from "react-relay";
import type { DefinitionsExplorerQuery } from "../../../../__generated__/DefinitionsExplorerQuery.graphql.js";
import definitionsExplorerQueryNode from "../../../../__generated__/DefinitionsExplorerQuery.graphql.js";
import {
  buildDefinitionsExplorerVariables,
  readTermParam,
} from "../../../definitionsQuery.js";
import { resolveFilter } from "../../../lensFilter.js";
import { useLensFilter } from "../../LensFilterProvider/index.js";
import type { UseExplorerQueryResult } from "./types.js";

/**
 * Read the explorer's operation where the layout renders, beside the
 * routed page: the strip's chips and status figure and the inspector.
 *
 * Nothing the page holds can reach them as a prop, and data the page
 * announced could only arrive in an effect: they would render empty on the
 * server and populated on the client, a hydration mismatch. So this reads
 * the SAME operation with the SAME variables, the term read off the route
 * exactly as the page reads it, from the store the route's `warm` filled: a
 * store hit on both sides, and no second request. It resolves the filter
 * through the same `resolveFilter` the page uses, so the strip, the graph
 * and the inspector cannot disagree.
 *
 * @note Impure: reads the router, the Relay store and the filter context,
 *   and suspends while the store does not hold the operation.
 * @returns The term, the operation's data, the ontologies' prefixes and
 *   namespaces, and the resolved filter with its setter.
 */
export default function useExplorerQuery(): UseExplorerQueryResult {
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
    term,
    data,
    prefixes,
    namespaces: data.ontologies.map(({ prefix, namespace }) => ({
      prefix,
      namespace,
    })),
    filter: resolveFilter(filter, prefixes),
    setFilter,
  };
}
