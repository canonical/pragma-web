import type { Renderer, RendererDeclaration, RendererFacts } from "./types.js";

/**
 * The renderers a view offers: each declaration in order, a name resolved
 * to the site's default of that name and a renderer of the lens's own taken
 * as given, then every renderer the data does not allow left out. A view
 * that declares nothing offers the site's defaults.
 *
 * @param declaration - The lens's declaration, or `undefined` for none.
 * @param defaults - The site's defaults for this kind of view.
 * @param facts - What the renderers' `offered` read.
 * @returns The offered renderers, in the declaration's order.
 * @throws When a name is not one of the site's defaults: a lens can only
 *   name a renderer the site has.
 */
export default function resolveRenderers<TProps>(
  declaration: readonly RendererDeclaration<TProps>[] | undefined,
  defaults: readonly Renderer<TProps>[],
  facts: RendererFacts,
): readonly Renderer<TProps>[] {
  const declared =
    declaration?.map((entry) => {
      if (typeof entry !== "string") {
        return { ...entry.renderer, name: entry.name };
      }
      const renderer = defaults.find(({ name }) => name === entry);
      if (renderer === undefined) {
        throw new Error(`renderer "${entry}" is not a site default`);
      }
      return renderer;
    }) ?? defaults;
  return declared.filter(({ offered }) => offered?.(facts) ?? true);
}
