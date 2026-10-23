// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { NodeRow_node$key } from "../../../__generated__/NodeRow_node.graphql.js";

type OwnProps = {
  /** The Relay fragment key of the Node to render, from an operation that spreads `...NodeRow_node`. */
  readonly node: NodeRow_node$key;
};

/**
 * Props accepted by `NodeRow`: its own, then the native props of the `<li>`
 * the row renders as its root. The native `children` are excluded: the
 * projection fills the row's slots from the node.
 */
export type NodeRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
