import type { PageRendererProps } from "@canonical/prism-core";
import { type RendererDeclaration, useRenderers } from "@canonical/prism-core";

/** The extension the probe asks for, and the probe's name. */
const STATEMENTS = "statements";

/** A page renderer the site offers only when its provider serves `statements`. */
const STATEMENTS_PROBE: RendererDeclaration<PageRendererProps> = {
  name: STATEMENTS,
  renderer: {
    name: STATEMENTS,
    label: STATEMENTS,
    render: () => null,
    offered: ({ extensions }) => extensions.has(STATEMENTS),
  },
};

/** A page renderer the site always offers, so the probe never empties the list. */
const ALWAYS: RendererDeclaration<PageRendererProps> = {
  name: "always",
  renderer: { name: "always", label: "always", render: () => null },
};

/**
 * Whether the site's provider serves the `statements` extension, read from
 * the extensions the renderers context holds, the facts every renderer's
 * `offered` reads.
 *
 * @returns `true` when the provider serves `statements`.
 * @note Impure: reads the renderers context and the address.
 */
export default function useServesStatements(): boolean {
  const { offered } = useRenderers("page", [STATEMENTS_PROBE, ALWAYS]);
  return offered.some(({ name }) => name === STATEMENTS);
}
