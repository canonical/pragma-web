import type { EntityBinding } from "@canonical/prism-core";
import type { EntityPageQuery$variables } from "../__generated__/EntityPageQuery.graphql.js";
import expandAddress from "./expandAddress.js";
import type { OntologyNamespace } from "./types.js";

/**
 * Build the entity page's variables: the entity's absolute IRI, expanded
 * from its address through the graph's namespaces, and the binding's class,
 * which the page checks the entity against.
 *
 * The route's `warmEntity` and the page's own read share this one builder,
 * so the variables are byte-identical everywhere and the warm store fulfils
 * every read.
 *
 * @param binding - The binding whose class the entity must belong to.
 * @param uri - The entity's address, compact or absolute.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @returns The operation's variables.
 */
export default function buildEntityPageVariables(
  binding: EntityBinding,
  uri: string,
  namespaces: readonly OntologyNamespace[],
): EntityPageQuery$variables {
  return {
    id: expandAddress(uri, namespaces),
    classUri: binding.classUri,
  };
}
