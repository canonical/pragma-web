// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ZoneGraphNode_node$key } from "#relay/__generated__/ZoneGraphNode_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Zone to render, from an operation that
   * spreads `...ZoneGraphNode_node`.
   */
  readonly node: ZoneGraphNode_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
};

/**
 * Props accepted by `ZoneGraphNode`: its own, then the native props of the
 * SVG `<g>` the node renders as its root. The native `children` are
 * excluded: the projection fills the node's slots from the zone.
 */
export type ZoneGraphNodeProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
