import type { ComponentProps, ComponentType } from "react";
import type {
  EntityRow_node$data,
  EntityRow_node$key,
} from "../../__generated__/EntityRow_node.graphql.js";

type OwnProps = {
  /** The node to represent, as a fragment key. */
  readonly node: EntityRow_node$key;
};

/**
 * Props accepted by `EntityRow`: its own, then the native props of the
 * `<li>` every row arm renders as its root. The native `children`
 * are excluded: the arm renders the row's slots from the node.
 */
export type EntityRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;

type ArmOwnProps = {
  /** The node, read through the row's composite fragment. */
  readonly node: EntityRow_node$data;
  /** The node's home, or `undefined` when the site declares none. */
  readonly href: string | undefined;
};

/**
 * Props a row arm receives: the node and its home, then the native props
 * of the `<li>` the arm renders as its root, without `children`.
 */
export type EntityRowArmProps = ArmOwnProps &
  Omit<ComponentProps<"li">, keyof ArmOwnProps | "children">;

/** A row arm: renders the row of one type of node. */
export type EntityRowArm = ComponentType<EntityRowArmProps>;
