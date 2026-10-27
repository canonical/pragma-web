// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CommandProjection_node$key } from "../../../__generated__/CommandProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...CommandProjection_node`.
   */
  readonly node: CommandProjection_node$key;
};

/**
 * Props accepted by `CommandProjection`, which renders no element of its own:
 * its own, then the native props of the `<li>` every command arm renders as its
 * root, without `children`: the arm fills its slots from the node.
 */
export type CommandProjectionProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;

/**
 * What every command arm receives beside its key: the dispatcher's native
 * props.
 */
export type CommandArmNative = Omit<CommandProjectionProps, "node">;
