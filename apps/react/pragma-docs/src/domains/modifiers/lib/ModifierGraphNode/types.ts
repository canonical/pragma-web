// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ModifierGraphNode_node$key } from "../../../../relay/__generated__/ModifierGraphNode_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Modifier to render, from an operation
   * that spreads `...ModifierGraphNode_node`.
   */
  readonly node: ModifierGraphNode_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
};

/**
 * Props accepted by `ModifierGraphNode`: its own, then the native props of the
 * SVG `<g>` the node renders as its root. The native `children` are
 * excluded: the projection fills the node's slots from the modifier.
 */
export type ModifierGraphNodeProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
