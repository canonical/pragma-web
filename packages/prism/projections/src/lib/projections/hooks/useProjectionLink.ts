import { useContext } from "react";
import ProjectionsContext from "../Context.js";
import type { UseProjectionLinkResult } from "./types.js";

/**
 * Read the link the nearest `ProjectionsProvider` renders a node's home
 * through: the site's router link adapter, or the intrinsic `"a"`.
 *
 * A site's own projections call it to render their homes through the same
 * link the package's arms do.
 *
 * @returns The link component every arm renders a home through.
 * @throws When no `ProjectionsProvider` is mounted above: that is a wiring
 *   bug, not a site without links.
 * @note Impure: reads the projection provider in scope.
 */
export default function useProjectionLink(): UseProjectionLinkResult {
  const projections = useContext(ProjectionsContext);
  if (projections === undefined) {
    throw new Error("useProjectionLink: no ProjectionsProvider above");
  }
  return projections.LinkComponent;
}
