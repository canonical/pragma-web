import type { EntityBinding } from "@canonical/prism-core";
import type { EntityIndexQuery$variables } from "../__generated__/EntityIndexQuery.graphql.js";
import { ENTITY_PAGE_SIZE } from "./constants.js";

/**
 * Build the index's variables: the binding's class and the first page of its
 * instances.
 *
 * The route's `warmEntityIndex`, the index's own read and the strip's share
 * this one builder, so the variables are byte-identical everywhere and the
 * warm store fulfils every read.
 *
 * @param binding - The binding whose class the index lists.
 * @returns The operation's variables.
 */
export default function buildEntityIndexVariables(
  binding: EntityBinding,
): EntityIndexQuery$variables {
  return {
    classUri: binding.classUri,
    count: ENTITY_PAGE_SIZE,
    cursor: null,
  };
}
