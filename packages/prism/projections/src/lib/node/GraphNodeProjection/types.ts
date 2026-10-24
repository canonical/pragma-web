// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { GraphNodeProjection_node$key } from "../../../__generated__/GraphNodeProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...GraphNodeProjection_node`.
   */
  readonly node: GraphNodeProjection_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
  /** The node's height in SVG user units; the graph's layout decides it. */
  readonly height?: number;
};

/**
 * Props accepted by `GraphNodeProjection`, which, as the other dispatchers,
 * renders no element of its own: its own, then the native props of the SVG
 * `<g>` every graph-node arm renders as its root, without `children`: the
 * arm fills its slots from the node.
 */
export type GraphNodeProjectionProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;

/**
 * What every graph-node arm receives beside its key: the dispatcher's native
 * props.
 */
export type GraphNodeArmNative = Omit<GraphNodeProjectionProps, "node">;
