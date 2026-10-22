import type { ComponentProps, ComponentType } from "react";
import type {
  EntityCard_node$data,
  EntityCard_node$key,
} from "../../__generated__/EntityCard_node.graphql.js";

type OwnProps = {
  /** The node to represent, as a fragment key. */
  readonly node: EntityCard_node$key;
};

/**
 * Props accepted by `EntityCard`: its own, then the native props of the
 * `<article>` every card arm renders as its root. The native `children`
 * are excluded: the arm renders the card's slots from the node.
 */
export type EntityCardProps = OwnProps &
  Omit<ComponentProps<"article">, keyof OwnProps | "children">;

type ArmOwnProps = {
  /** The node, read through the card's composite fragment. */
  readonly node: EntityCard_node$data;
  /** The node's home, or `undefined` when the site declares none. */
  readonly href: string | undefined;
};

/**
 * Props a card arm receives: the node and its home, then the native props
 * of the `<article>` the arm renders as its root, without `children`.
 */
export type EntityCardArmProps = ArmOwnProps &
  Omit<ComponentProps<"article">, keyof ArmOwnProps | "children">;

/** A card arm: renders the card of one type of node. */
export type EntityCardArm = ComponentType<EntityCardArmProps>;
