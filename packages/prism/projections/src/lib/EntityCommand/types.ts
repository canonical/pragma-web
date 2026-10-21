import type { ComponentProps, ComponentType } from "react";
import type {
  EntityCommand_node$data,
  EntityCommand_node$key,
} from "../../__generated__/EntityCommand_node.graphql.js";

type OwnProps = {
  /** The node to represent, as a fragment key. */
  readonly node: EntityCommand_node$key;
};

/**
 * Props accepted by `EntityCommand`: its own, then the native props of the
 * `<li>` every command arm renders as its root. The native `children`
 * are excluded: the arm renders the command's slots from the node.
 */
export type EntityCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;

type ArmOwnProps = {
  /** The node, read through the command's composite fragment. */
  readonly node: EntityCommand_node$data;
  /** The node's home, or `undefined` when the site declares none. */
  readonly href: string | undefined;
};

/**
 * Props a command arm receives: the node and its home, then the native props
 * of the `<li>` the arm renders as its root, without `children`.
 */
export type EntityCommandArmProps = ArmOwnProps &
  Omit<ComponentProps<"li">, keyof ArmOwnProps | "children">;

/** A command arm: renders the command of one type of node. */
export type EntityCommandArm = ComponentType<EntityCommandArmProps>;
