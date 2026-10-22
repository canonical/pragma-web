import { useContext } from "react";
import ProjectionsContext from "../Context.js";
import type { UseProjectionMapsResult } from "./types.js";

/**
 * Read the projection maps the nearest `ProjectionsProvider` holds.
 *
 * @returns The site's maps, one per representation.
 * @throws When no `ProjectionsProvider` is mounted above: that is a wiring
 *   bug, not a site without maps.
 */
export default function useProjectionMaps(): UseProjectionMapsResult {
  const projections = useContext(ProjectionsContext);
  if (projections === undefined) {
    throw new Error("useProjectionMaps: no ProjectionsProvider above");
  }
  return projections.maps;
}
