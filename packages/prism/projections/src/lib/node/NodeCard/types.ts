// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { NodeCard_node$key } from "../../../__generated__/NodeCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to render, from an operation that
   * spreads `...NodeCard_node`.
   */
  readonly node: NodeCard_node$key;
};

/**
 * Props accepted by `NodeCard`: its own, then the native props of the
 * `<div>` the card renders as its root. The native `children` are excluded:
 * the projection fills the card's slots from the node.
 */
export type NodeCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
