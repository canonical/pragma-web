// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { RowProjection_node$key } from "../../../__generated__/RowProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...RowProjection_node`.
   */
  readonly node: RowProjection_node$key;
  /**
   * How many lines the row takes, handed to the arm's `EntityRow`: one
   * (32px), or two (56px), the summary under the title, where an index
   * opts in.
   */
  readonly lines?: "one" | "two";
};

/**
 * Props accepted by `RowProjection`, which renders no element of its own:
 * its own, then the native props of the `<li>` every row arm renders as its
 * root, without `children`: the arm fills its slots from the node.
 */
export type RowProjectionProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;

/**
 * What every row arm receives beside its key: the dispatcher's native props.
 */
export type RowArmNative = Omit<RowProjectionProps, "node">;
