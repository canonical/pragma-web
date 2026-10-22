import type { LinkComponent } from "@canonical/react-ds-global";
import type { ProjectionMaps } from "../types.js";

/** What `useProjectionMaps` returns: the maps the nearest provider holds. */
export type UseProjectionMapsResult = ProjectionMaps;

/**
 * What `useProjectionLink` returns: the link the nearest provider renders a
 * node's home through.
 */
export type UseProjectionLinkResult = LinkComponent;
