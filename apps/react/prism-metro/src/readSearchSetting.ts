/**
 * Read the `PRISM_SEARCH` setting: Vite's env first, then the process env.
 *
 * The builds replace Vite's member access with the value set when they ran,
 * so `PRISM_SEARCH=off` at build leaves search out of the bundles; the graph
 * server and the schema writer run under Bun, whose Vite env is the process
 * env, and read it as they start.
 *
 * @returns The setting, or undefined when it is not set.
 * @note Impure: reads the ambient environment.
 */
export default function readSearchSetting(): string | undefined {
  return (
    // The literal member access is required: Vite's static replacement only
    // matches `import.meta.env.PRISM_SEARCH` spelled out.
    import.meta.env?.PRISM_SEARCH ??
    /* v8 ignore next -- runtime detection: the browser bundle has no `process`, unreachable under the test environments */
    (typeof process === "undefined" ? undefined : process.env.PRISM_SEARCH)
  );
}
