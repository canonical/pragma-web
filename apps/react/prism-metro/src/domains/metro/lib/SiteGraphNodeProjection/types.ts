// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { SiteGraphNodeProjection_node$key } from "../../../../relay/__generated__/SiteGraphNodeProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the site slot to dispatch, from the package's
   * graph node dispatcher, whose composite spreads `...SiteGraphNodeProjection_node`.
   */
  readonly node: SiteGraphNodeProjection_node$key;
  /** The node's typename, the package's dispatch key. */
  readonly typename: string;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
};

/**
 * Props accepted by `SiteGraphNodeProjection`, which
 * renders no element of its own: its own, then the native props of the SVG
 * `<g>` every graph node arm renders as its root, without `children`: the
 * arm fills its slots from the node.
 */
export type SiteGraphNodeProjectionProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
