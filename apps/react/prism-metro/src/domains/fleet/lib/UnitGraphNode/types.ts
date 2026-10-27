// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { UnitGraphNode_node$key } from "#relay/__generated__/UnitGraphNode_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Unit to render, from an operation that
   * spreads `...UnitGraphNode_node`.
   */
  readonly node: UnitGraphNode_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
  /**
   * The node's height in SVG user units; the graph's layout decides it. A
   * node with no kind and no location sets its title on the box's middle.
   */
  readonly height?: number;
};

/**
 * Props accepted by `UnitGraphNode`: its own, then the native props of the
 * `<g>` the EntityGraphNode renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type UnitGraphNodeProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
