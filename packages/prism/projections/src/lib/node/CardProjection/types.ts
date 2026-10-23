// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CardProjection_node$key } from "../../../__generated__/CardProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...CardProjection_node`.
   */
  readonly node: CardProjection_node$key;
};

/**
 * Props accepted by `CardProjection`, which renders no element of its own:
 * its own, then the native props of the `<div>` every card arm renders as its
 * root, without `children`: the arm fills its slots from the node.
 */
export type CardProjectionProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;

/**
 * What every card arm receives beside its key: the dispatcher's native props.
 */
export type CardArmNative = Omit<CardProjectionProps, "node">;
