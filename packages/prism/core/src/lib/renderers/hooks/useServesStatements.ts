import { useContext } from "react";
import RenderersContext from "../Context.js";

/**
 * Whether the site's provider serves the `statements` extension, read from
 * the extensions the renderers context holds; outside a `RenderersProvider`,
 * a site that serves none.
 *
 * @returns `true` when the provider serves `statements`.
 * @note Impure: reads the renderers context.
 */
export default function useServesStatements(): boolean {
  return useContext(RenderersContext).facts.extensions.has("statements");
}
