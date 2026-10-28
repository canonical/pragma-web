import type { ComponentProps, ComponentType, ReactNode } from "react";
import type {
  ChipProjection_node$data,
  ChipProjection_node$key,
} from "../../__generated__/ChipProjection_node.graphql.js";

type OwnProps = {
  /** The node to mention, as a fragment key. */
  readonly node: ChipProjection_node$key;
  /** The mention's text, in place of the node's own title. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `ChipProjection`: its own, then the native props of the
 * `<span>` every chip arm renders as its root.
 */
export type ChipProjectionProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;

type ArmOwnProps = {
  /** The node, read through the chip's composite fragment. */
  readonly node: ChipProjection_node$data;
  /** The node's home, or `undefined` when the site declares none. */
  readonly href: string | undefined;
  /** The mention's text, in place of the node's own title. */
  readonly children?: ReactNode;
};

/**
 * Props a chip arm receives: the node, its home and the mention's text, then
 * the native props of the `<span>` the arm renders as its root.
 */
export type ChipArmProps = ArmOwnProps &
  Omit<ComponentProps<"span">, keyof ArmOwnProps>;

/** A chip arm: renders the chip of one type of node. */
export type ChipArm = ComponentType<ChipArmProps>;
