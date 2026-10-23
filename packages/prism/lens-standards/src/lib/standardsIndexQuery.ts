/**
 * The Standards index route's query contract: the compiled
 * `StandardsIndexQuery` operation plus the one variables builder, shared by
 * the route's `warmStandardsIndex` and the index page's hook, so the
 * variables are byte-identical everywhere. It imports the artifact only; the
 * tag lives in `StandardsPage.tsx`.
 */

import type { StandardsIndexQuery$variables } from "../__generated__/StandardsIndexQuery.graphql.js";
import standardsIndexQueryNode from "../__generated__/StandardsIndexQuery.graphql.js";
import { STANDARDS_PAGE_SIZE } from "./constants.js";

/** The compiled operation (full text under `params.text`, `id: null`). */
export { standardsIndexQueryNode };

/**
 * The index page's variables: the first page of the bound class's
 * instances. The route has no params and no search schema, so the class the
 * site binds the lens to is the one input.
 *
 * @param classUri - The bound class, as the site's binding names it.
 * @returns The variables of the index's one operation.
 */
export const buildStandardsIndexVariables = (
  classUri: string,
): StandardsIndexQuery$variables => ({
  classUri,
  count: STANDARDS_PAGE_SIZE,
  cursor: null,
});
