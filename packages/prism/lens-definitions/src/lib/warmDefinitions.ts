import { getPrefetchEnvironment, prefetchQuery } from "@canonical/prism-core";
import { expandAddress, warmEntityPanel } from "@canonical/prism-lens-entity";
import { createOperationDescriptor } from "relay-runtime";
import type { DefinitionsExplorerQuery$data } from "../__generated__/DefinitionsExplorerQuery.graphql.js";
import {
  buildDefinitionsExplorerVariables,
  definitionsExplorerQueryNode,
  readTermParam,
} from "./definitionsQuery.js";

/**
 * Warm the store for the definitions explorer: prefetch the explorer's one
 * operation, with the selected term when the URL names one
 * (`/definitions/:term`) and without it otherwise (`/definitions`). A term
 * that is neither a class nor a property is an instance, which the
 * inspector shows in the details panel: its reads are warmed too, at the
 * term's address expanded through the ontologies' namespaces. Both of the
 * lens's routes declare it as their `warm`.
 *
 * `import { warmDefinitions } from "@canonical/prism-lens-definitions";`
 *
 * @param params - The matched route params, carrying the percent-decoded
 *   `term` when present.
 * @returns A promise that settles when the store holds the data or the
 *   fetch fails.
 * @note Impure: fetches into the prefetch environment published at the
 *   moment of the call (read then, since a server clears it before the
 *   fetch settles) and reads the explorer's answer back from its store.
 */
export default function warmDefinitions(
  params: Readonly<Record<string, unknown>>,
): Promise<void> {
  const term = readTermParam(params);
  const variables = buildDefinitionsExplorerVariables(term);
  // Read now: the server's prepare step clears the published environment
  // as soon as this call returns, before the explorer's fetch settles.
  const environment = getPrefetchEnvironment();
  return prefetchQuery(definitionsExplorerQueryNode, variables).then(() => {
    if (term === undefined || environment === undefined) return undefined;
    const { data } = environment.lookup(
      createOperationDescriptor(definitionsExplorerQueryNode, variables)
        .fragment,
    );
    const explorer = data as DefinitionsExplorerQuery$data | undefined;
    if (
      explorer?.ontologies === undefined ||
      explorer.ontologyClass != null ||
      explorer.ontologyProperty != null
    ) {
      return undefined;
    }
    return warmEntityPanel(
      environment,
      expandAddress(term, explorer.ontologies),
    );
  });
}
