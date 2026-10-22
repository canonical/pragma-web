/**
 * Where the metro graph lives: its default address, the variable that
 * overrides it, and the resolver every reader of the endpoint calls.
 *
 * @module
 */

export { DEFAULT_GRAPHQL_URL, GRAPHQL_URL_ENV_VAR } from "./constants.js";
export { default as resolveGraphqlUrl } from "./resolveGraphqlUrl.js";
