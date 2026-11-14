import { BINDING_PROBE_QUERY, HIDDEN_VISIBILITY } from "./constants.js";
import type { EntityBinding, GraphQLExecute } from "./types.js";

/**
 * Check `bindings` against the running graph, as a site does at boot: the
 * graph answers the probe for every binding's class without errors, knows
 * the class, and does not hide it (a hidden class's instances are values,
 * so no index lists them).
 *
 * The probes run one after another, so a failure names the first binding
 * that broke.
 *
 * @param execute - Runs one operation against the graph.
 * @param bindings - The site's bindings.
 * @throws When a probe answers with errors, without the class, or with a
 *   hidden class; the message names the binding.
 * @note Impure: runs one graph operation per binding through `execute`.
 */
export default async function assertBindingsLive(
  execute: GraphQLExecute,
  bindings: readonly EntityBinding[],
): Promise<void> {
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
      | {
          readonly ontologyClass?: {
            readonly visibility?: unknown;
          } | null;
        }
      | null
      | undefined;
    const ontologyClass = data?.ontologyClass;
    if (ontologyClass === null || ontologyClass === undefined) {
      throw new Error(
        `assertBindingsLive: binding "${id}" names class "${classUri}", which the graph does not know`,
      );
    }
    if (ontologyClass.visibility === HIDDEN_VISIBILITY) {
      throw new Error(
        `assertBindingsLive: binding "${id}" names class "${classUri}", which the graph hides: a hidden class's instances are values, never an index`,
      );
    }
  }
}
