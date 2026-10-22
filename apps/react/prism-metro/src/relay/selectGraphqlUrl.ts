import { DEFAULT_GRAPHQL_URL } from "./constants.js";

/**
 * Pick the graph endpoint from the two places a runtime may configure it:
 * Vite's env first, then the process env, then `DEFAULT_GRAPHQL_URL`. A
 * value that is not a non-empty string counts as unset, so a bare
 * `VITE_GRAPHQL_URL=` does not resolve to `""`.
 *
 * @param fromVite - `VITE_GRAPHQL_URL` as Vite's env holds it.
 * @param fromProcess - `VITE_GRAPHQL_URL` as the process env holds it.
 * @returns The absolute URL of the graph's GraphQL endpoint.
 */
export default function selectGraphqlUrl(
  fromVite: unknown,
  fromProcess: unknown,
): string {
  if (typeof fromVite === "string" && fromVite.length > 0) return fromVite;
  if (typeof fromProcess === "string" && fromProcess.length > 0) {
    return fromProcess;
  }
  return DEFAULT_GRAPHQL_URL;
}
