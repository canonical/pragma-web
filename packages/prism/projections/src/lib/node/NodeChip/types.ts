// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { NodeChip_node$key } from "../../../__generated__/NodeChip_node.graphql.js";

type OwnProps = {
  /** The Relay fragment key of the Node to render, from an operation that spreads `...NodeChip_node`. */
  readonly node: NodeChip_node$key;
  /** The mention's text, in place of the node's title. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `NodeChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type NodeChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
