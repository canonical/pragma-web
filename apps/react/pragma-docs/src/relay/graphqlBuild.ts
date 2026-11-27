/**
 * Build-time guard for the release client build.
 *
 * The runtime fallback in `graphqlEndpoint.ts` is a development default: in a
 * visitor's browser, `127.0.0.1` is the visitor's own machine. A release build
 * must therefore carry an explicit endpoint, and this guard refuses to compile
 * one without it so the mistake surfaces at build time rather than after
 * deployment.
 */

import { GRAPHQL_URL_ENV_VAR } from "./graphqlEndpoint.js";

/**
 * Throws when a release client build has no configured GraphQL endpoint.
 *
 * An empty string counts as unset, matching the resolver's treatment of a bare
 * `VITE_GRAPHQL_URL=` line.
 */
export const assertReleaseGraphqlUrl = (url: string | undefined): void => {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error(
      `${GRAPHQL_URL_ENV_VAR} must be set for a release client build. ` +
        "The loopback default is for development only; set it to a publicly reachable GraphQL endpoint.",
    );
  }
};
