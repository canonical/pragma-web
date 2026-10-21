/**
 * The index route's query contract: the compiled `EntityIndexQuery`
 * operation and the one variables builder, shared by the route's
 * `warmEntityIndex`, the index's own read and the strip's, so the variables
 * are byte-identical everywhere and the warm store fulfils every read. It
 * imports the artifact only; the tag lives in `EntityIndexPage.tsx`.
 */

import type { EntityBinding } from "@canonical/prism-core";
import type { EntityIndexQuery$variables } from "../__generated__/EntityIndexQuery.graphql.js";
import entityIndexQueryNode from "../__generated__/EntityIndexQuery.graphql.js";
import { ENTITY_PAGE_SIZE } from "./constants.js";

/** The compiled operation (full text under `params.text`, `id: null`). */
export { entityIndexQueryNode };

/**
 * Build the index's variables: the binding's class and the first page of its
 * instances.
 *
 * @param binding - The binding whose class the index lists.
 * @returns The operation's variables.
 */
export const buildEntityIndexVariables = (
  binding: EntityBinding,
): EntityIndexQuery$variables => ({
  classUri: binding.classUri,
  count: ENTITY_PAGE_SIZE,
  cursor: null,
});
