import type { PageRendererProps } from "@canonical/prism-core";
import { type RendererDeclaration, useRenderers } from "@canonical/prism-core";

/** The extension the probe asks for, and the probe's name. */
const STATEMENTS = "statements";

/** The name of the entry that keeps the probed list from ever being empty. */
const ALWAYS = "always";

/**
 * Whether the site's provider serves the `statements` extension, read from
 * the extensions the renderers context holds, the facts every renderer's
 * `offered` reads: it probes the site's renderers with one offered only
 * when the provider serves `statements`, beside one offered always. Both
 * draw as the site's active page renderer does; nothing draws them.
 *
 * @returns `true` when the provider serves `statements`.
 * @note Impure: reads the renderers context and the address.
 */
export default function useServesStatements(): boolean {
  const { render } = useRenderers("page").active;
  const probes: readonly RendererDeclaration<PageRendererProps>[] = [
    {
      name: STATEMENTS,
      renderer: {
        name: STATEMENTS,
        label: STATEMENTS,
        render,
        offered: ({ extensions }) => extensions.has(STATEMENTS),
      },
    },
    { name: ALWAYS, renderer: { name: ALWAYS, label: ALWAYS, render } },
  ];
  const { offered } = useRenderers("page", probes);
  return offered.some(({ name }) => name === STATEMENTS);
}
