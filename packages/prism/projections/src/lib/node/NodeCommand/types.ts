// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { NodeCommand_node$key } from "../../../__generated__/NodeCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to render, from an operation that
   * spreads `...NodeCommand_node`.
   */
  readonly node: NodeCommand_node$key;
};

/**
 * Props accepted by `NodeCommand`: its own, then the native props of the
 * `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the node.
 */
export type NodeCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
