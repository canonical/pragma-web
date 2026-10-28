// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { InterchangeGraphNode_node$key } from "#relay/__generated__/InterchangeGraphNode_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Interchange to render, from an operation that
   * spreads `...InterchangeGraphNode_node`.
   */
  readonly node: InterchangeGraphNode_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
  /** The node's height in SVG user units; the graph's layout decides it. */
  readonly height?: number;
};

/**
 * Props accepted by `InterchangeGraphNode`: its own, then the native props of the
 * SVG `<g>` the node renders as its root. The native `children` are
 * excluded: the projection fills the node's slots from the interchange.
 */
export type InterchangeGraphNodeProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
