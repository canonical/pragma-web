import selectGraphqlUrl from "./selectGraphqlUrl.js";

/**
 * Resolve the graph endpoint for the current runtime, from Vite's env, then
 * the process env, then the default (see `selectGraphqlUrl`).
 *
 * Vite's env answers in the browser and under Bun. The compiled server
 * renderer has the variable replaced at build time with nothing, so it reads
 * the process env at run time, which is how a preview server is pointed at a
 * graph without baking one port into the build.
 *
 * @returns The absolute URL of the graph's GraphQL endpoint.
 * @note Impure: reads the ambient environment.
 */
export default function resolveGraphqlUrl(): string {
  return selectGraphqlUrl(
    // The literal member access is required: Vite's static replacement only
    // matches `import.meta.env.VITE_GRAPHQL_URL` spelled out.
    import.meta.env?.VITE_GRAPHQL_URL,
    /* v8 ignore next -- runtime detection: the browser bundle has no `process`, unreachable under the test environments */
    typeof process === "undefined" ? undefined : process.env.VITE_GRAPHQL_URL,
  );
}
