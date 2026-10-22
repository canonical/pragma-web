/**
 * The Definitions lens's query contract: the compiled
 * `DefinitionsExplorerQuery` operation plus the one variables builder,
 * shared by the route's `warmDefinitions` and the explorer's hook, so the
 * variables are byte-identical everywhere. It imports the artifact only;
 * the tag lives in `DefinitionsExplorer.tsx`.
 *
 * ONE operation serves BOTH routes (`/definitions` and `/definitions/:term`):
 * the term-less explorer runs the same operation with `hasTerm: false`
 * (and a degenerate empty `uri` — the schema's `uri` argument is
 * non-nullable, and `@include(if: $hasTerm)` keeps the lookup fields out
 * of the term-less execution entirely).
 */

import type { DefinitionsExplorerQuery$variables } from "../__generated__/DefinitionsExplorerQuery.graphql.js";
import definitionsExplorerQueryNode from "../__generated__/DefinitionsExplorerQuery.graphql.js";

/** The compiled operation (full text under `params.text`, `id: null`). */
export { definitionsExplorerQueryNode };

/**
 * Read the optional `:term` param off a route match. `undefined` on
 * `/definitions` (no default term — the explorer with an empty
 * inspector); asserts the shape at the one boundary where params are
 * `unknown`-typed records.
 */
export const readTermParam = (
  params: Readonly<Record<string, unknown>>,
): string | undefined => {
  const term = params.term;
  if (term === undefined) return undefined;
  if (typeof term !== "string" || term.length === 0) {
    throw new Error(
      "definitions :term param must be a non-empty string when present",
    );
  }
  return term;
};

/**
 * The explorer's variables — one builder, so the server-executed
 * operation, the prefetch warm-up, and the component's store read use
 * identical values.
 */
export const buildDefinitionsExplorerVariables = (
  term: string | undefined,
): DefinitionsExplorerQuery$variables => ({
  uri: term ?? "",
  hasTerm: term !== undefined,
});
