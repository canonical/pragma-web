import { useSearchParam } from "@canonical/router-react";
import { useContext } from "react";
import RenderersContext from "../Context.js";
import { VIEW_PARAMS } from "../constants.js";
import readRenderer from "../readRenderer.js";
import resolveRenderers from "../resolveRenderers.js";
import type {
  ListRendererProps,
  PageRendererProps,
  RendererDeclaration,
  RendererKind,
  ResolvedRenderers,
} from "../types.js";

/**
 * The renderers a view offers, from its lens's declaration over the site's
 * defaults, and the one the address's `as` selects.
 *
 * @param kind - The kind of view: an index, or an entity's page.
 * @param declaration - The lens's declaration for that kind, or `undefined`
 *   for the site's defaults.
 * @returns The offered renderers and the active one.
 * @throws When a declared name is not a site default, or the view offers
 *   no renderer.
 * @note Impure: reads the renderers context and the address.
 */
function useRenderers(
  kind: "list",
  declaration?: readonly RendererDeclaration<ListRendererProps>[],
): ResolvedRenderers<ListRendererProps>;
function useRenderers(
  kind: "page",
  declaration?: readonly RendererDeclaration<PageRendererProps>[],
): ResolvedRenderers<PageRendererProps>;
function useRenderers(
  kind: RendererKind,
  declaration?: readonly RendererDeclaration<never>[],
): ResolvedRenderers<never> {
  const { defaults, facts } = useContext(RenderersContext);
  const value = useSearchParam(VIEW_PARAMS.renderer);
  const offered = resolveRenderers<never>(declaration, defaults[kind], facts);
  return { offered, active: readRenderer(value, offered) };
}

export default useRenderers;
