import type { ComponentProps, ComponentType } from "react";
import type {
  EntityTitle_node$data,
  EntityTitle_node$key,
} from "../../__generated__/EntityTitle_node.graphql.js";

type OwnProps = {
  /** The node to represent, as a fragment key. */
  readonly node: EntityTitle_node$key;
};

/**
 * Props accepted by `EntityTitle`: its own, then the native props of the
 * `<hgroup>` every title arm renders as its root. The native `children`
 * are excluded: the arm renders the title's slots from the node.
 */
export type EntityTitleProps = OwnProps &
  Omit<ComponentProps<"hgroup">, keyof OwnProps | "children">;

type ArmOwnProps = {
  /** The node, read through the title's composite fragment. */
  readonly node: EntityTitle_node$data;
  /** The node's home, or `undefined` when the site declares none. */
  readonly href: string | undefined;
};

/**
 * Props a title arm receives: the node and its home, then the native props
 * of the `<hgroup>` the arm renders as its root, without `children`.
 */
export type EntityTitleArmProps = ArmOwnProps &
  Omit<ComponentProps<"hgroup">, keyof ArmOwnProps | "children">;

/** A title arm: renders the title of one type of node. */
export type EntityTitleArm = ComponentType<EntityTitleArmProps>;
