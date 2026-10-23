/**
 * Where the metro graph lives: its default address, the variable that
 * overrides it, and the resolver every reader of the endpoint calls; and
 * the app's own compiled operation, `MetroHomeQuery`, which relay-compiler
 * writes to `__generated__/` (a directory it owns and writes no barrel for)
 * before every package script that loads the app's code.
 *
 * @module
 */

export type {
  MetroHomeQuery,
  MetroHomeQuery$data,
  MetroHomeQuery$variables,
} from "./__generated__/MetroHomeQuery.graphql.js";
/** The compiled `MetroHomeQuery`, the landing's one operation. */
export { default as metroHomeQueryNode } from "./__generated__/MetroHomeQuery.graphql.js";
export { DEFAULT_GRAPHQL_URL, GRAPHQL_URL_ENV_VAR } from "./constants.js";
export { default as resolveGraphqlUrl } from "./resolveGraphqlUrl.js";
