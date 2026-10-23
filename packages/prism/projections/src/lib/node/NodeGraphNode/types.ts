// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { NodeGraphNode_node$key } from "../../../__generated__/NodeGraphNode_node.graphql.js";

type OwnProps = {
  /** The Relay fragment key of the Node to render, from an operation that spreads `...NodeGraphNode_node`. */
  readonly node: NodeGraphNode_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
};

/**
 * Props accepted by `NodeGraphNode`: its own, then the native props of the
 * SVG `<g>` the graph node renders as its root. The native `children` are
 * excluded: the projection fills the node's slots from the node.
 */
export type NodeGraphNodeProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
