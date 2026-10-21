/**
 * The reading route's query contract: the compiled `StandardEntityQuery`
 * operation, the param reader and the one variables builder, shared by the
 * route's `warmStandardEntity` and the reading page's hook, so the variables
 * are byte-identical everywhere. It imports the artifact only; the tag lives
 * in `StandardReadingPage.tsx`.
 *
 * THE ROUTE PARAM IS THE STANDARD'S ABSOLUTE IRI, percent-encoded:
 * `/standards/http%3A%2F%2Fpragma.canonical.com%2Fcodestandards%23react.component.props`.
 * The contract's one entity lookup, `node(id:)`, takes the absolute IRI and
 * nothing else (`EntityMeta.curie`'s own docstring says the compact form "is
 * not accepted by `node(id:)`"), so the address the lookup needs is the
 * address the URL carries.
 *
 * A compact address in the URL would need the graph's namespaces on both
 * server and client before routing, because the builder below is a
 * synchronous pure function the route's `warm` calls directly: that is a
 * namespace bootstrap, its SSR serialisation and its hydration path, a
 * second source of truth about namespaces. It would be strictly additive
 * (only this builder changes), which is why the absolute form is the one
 * this lens addresses by.
 */

import type { StandardEntityQuery$variables } from "../__generated__/StandardEntityQuery.graphql.js";
import standardEntityQueryNode from "../__generated__/StandardEntityQuery.graphql.js";

/** The compiled operation (full text under `params.text`, `id: null`). */
export { standardEntityQueryNode };

/**
 * Read the `:uri` param off a route match: the standard's absolute IRI,
 * percent-decoded by the router codec. Asserts the shape at the one boundary
 * where params are `unknown`-typed records.
 *
 * @param params - The matched route params.
 * @returns The standard's absolute IRI.
 * @throws When `uri` is missing, empty or not a string.
 */
export const readUriParam = (
  params: Readonly<Record<string, unknown>>,
): string => {
  const uri = params.uri;
  if (typeof uri !== "string" || uri.length === 0) {
    throw new Error("standards :uri param must be a non-empty string");
  }
  return uri;
};

/**
 * The reading page's variables. `classUri` is the site's binding: the page
 * cannot tell a standard from any other node without it, because
 * `node(id:)` returns any node at all.
 *
 * @param classUri - The bound class, as the site's binding names it.
 * @param uri - The standard's absolute IRI.
 * @returns The variables of the reading page's one operation.
 */
export const buildStandardEntityVariables = (
  classUri: string,
  uri: string,
): StandardEntityQuery$variables => ({ uri, classUri });
