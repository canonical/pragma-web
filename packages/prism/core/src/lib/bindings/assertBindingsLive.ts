import { BINDING_PROBE_QUERY } from "./constants.js";
import type { EntityBinding, GraphQLExecute } from "./types.js";

/**
 * Check `bindings` against the running graph, as a site does at boot: the
 * graph answers the probe for every binding's class without errors, and
 * knows the class.
 *
 * The probes run one after another, so a failure names the first binding
 * that broke.
 *
 * @param execute - Runs one operation against the graph.
 * @param bindings - The site's bindings.
 * @throws When a probe answers with errors or without the class; the
 *   message names the binding.
 * @note Impure: runs one graph operation per binding through `execute`.
 */
export const assertBindingsLive = async (
  execute: GraphQLExecute,
  bindings: readonly EntityBinding[],
): Promise<void> => {
  for (const { id, classUri } of bindings) {
    const result = await execute(BINDING_PROBE_QUERY, { uri: classUri });
    const errors = result.errors ?? [];
    if (errors.length > 0) {
      throw new Error(
        `assertBindingsLive: binding "${id}" probe failed: ${errors.map(({ message }) => message).join("; ")}`,
      );
    }
    // The graph's answer is external data: read it without trusting its shape.
    const data = result.data as
      | { readonly ontologyClass?: unknown }
      | null
      | undefined;
    if (data?.ontologyClass === null || data?.ontologyClass === undefined) {
      throw new Error(
        `assertBindingsLive: binding "${id}" names class "${classUri}", which the graph does not know`,
      );
    }
  }
};
