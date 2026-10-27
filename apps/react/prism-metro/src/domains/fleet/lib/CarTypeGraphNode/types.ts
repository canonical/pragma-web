// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CarTypeGraphNode_node$key } from "#relay/__generated__/CarTypeGraphNode_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CarType to render, from an operation that
   * spreads `...CarTypeGraphNode_node`.
   */
  readonly node: CarTypeGraphNode_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
  /**
   * The node's height in SVG user units; the graph's layout decides it. A
   * node with no kind and no location sets its title on the box's middle.
   */
  readonly height?: number;
};

/**
 * Props accepted by `CarTypeGraphNode`: its own, then the native props of the
 * `<g>` the EntityGraphNode renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type CarTypeGraphNodeProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
