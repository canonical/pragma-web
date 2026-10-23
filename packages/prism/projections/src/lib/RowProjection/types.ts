import type { ComponentProps, ComponentType } from "react";
import type {
  RowProjection_node$data,
  RowProjection_node$key,
} from "../../__generated__/RowProjection_node.graphql.js";

type OwnProps = {
  /** The node to represent, as a fragment key. */
  readonly node: RowProjection_node$key;
};

/**
 * Props accepted by `RowProjection`: its own, then the native props of the
 * `<li>` every row arm renders as its root. The native `children`
 * are excluded: the arm renders the row's slots from the node.
 */
export type RowProjectionProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;

type ArmOwnProps = {
  /** The node, read through the row's composite fragment. */
  readonly node: RowProjection_node$data;
  /** The node's home, or `undefined` when the site declares none. */
  readonly href: string | undefined;
};

/**
 * Props a row arm receives: the node and its home, then the native props
 * of the `<li>` the arm renders as its root, without `children`.
 */
export type RowArmProps = ArmOwnProps &
  Omit<ComponentProps<"li">, keyof ArmOwnProps | "children">;

/** A row arm: renders the row of one type of node. */
export type RowArm = ComponentType<RowArmProps>;
