/**
 * The entity route's query contract: the two compiled operations it runs,
 * the namespaces lookup and the page itself, and the param reader and the
 * variables builder that the route's `warmEntity` and the page's own reads
 * share, so the variables are byte-identical everywhere and the warm store
 * fulfils every read. It imports the artifacts only; the tags live in
 * `EntityPage.tsx`.
 */

import type { EntityBinding } from "@canonical/prism-core";
import entityNamespacesQueryNode from "../__generated__/EntityNamespacesQuery.graphql.js";
import type { EntityPageQuery$variables } from "../__generated__/EntityPageQuery.graphql.js";
import entityPageQueryNode from "../__generated__/EntityPageQuery.graphql.js";
import { ENTITY_URI_PARAM } from "./constants.js";
import expandAddress from "./expandAddress.js";
import type { OntologyNamespace } from "./types.js";

/** The compiled operations (full text under `params.text`, `id: null`). */
export { entityNamespacesQueryNode, entityPageQueryNode };

/**
 * Read the entity route's `:uri` param off a route match, asserting its
 * shape at the one boundary where params are `unknown`-typed records.
 *
 * @param params - The matched route params, percent-decoded.
 * @returns The entity's address, compact or absolute.
 * @throws When the param is missing, not a string, or empty.
 */
export const readUriParam = (
  params: Readonly<Record<string, unknown>>,
): string => {
  const uri = params[ENTITY_URI_PARAM];
  if (typeof uri !== "string" || uri.length === 0) {
    throw new Error(
      `entity :${ENTITY_URI_PARAM} param must be a non-empty string`,
    );
  }
  return uri;
};

/**
 * Build the entity page's variables: the entity's absolute IRI, expanded
 * from its address through the graph's namespaces, and the binding's class,
 * which the page checks the entity against.
 *
 * @param binding - The binding whose class the entity must belong to.
 * @param uri - The entity's address, compact or absolute.
 * @param namespaces - The prefixes and namespaces the graph declares.
 * @returns The operation's variables.
 */
export const buildEntityPageVariables = (
  binding: EntityBinding,
  uri: string,
  namespaces: readonly OntologyNamespace[],
): EntityPageQuery$variables => ({
  id: expandAddress(uri, namespaces),
  classUri: binding.classUri,
});
