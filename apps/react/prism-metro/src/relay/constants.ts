/**
 * The metro graph's address when nothing configures one: the loopback port
 * `bun run graph` serves on. It is a development default; a deployment sets
 * `VITE_GRAPHQL_URL` when it builds the client, and Vite replaces the
 * variable into the browser bundle.
 */
export const DEFAULT_GRAPHQL_URL = "http://127.0.0.1:5176/graphql";

/**
 * The environment variable that overrides `DEFAULT_GRAPHQL_URL`. The
 * `VITE_` prefix is what makes Vite expose it to the browser bundle, one of
 * the endpoint's readers.
 */
export const GRAPHQL_URL_ENV_VAR = "VITE_GRAPHQL_URL";
