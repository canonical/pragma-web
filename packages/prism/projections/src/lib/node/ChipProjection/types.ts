// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { ChipProjection_node$key } from "../../../__generated__/ChipProjection_node.graphql.js";

type OwnProps = {
  /** The Relay fragment key of the Node to dispatch, from an operation that spreads `...ChipProjection_node`. */
  readonly node: ChipProjection_node$key;
  /** The mention's text, in place of the node's own name. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `ChipProjection`, which renders no element of its own:
 * its own, then the native props of the `<span>` every chip arm renders as its
 * root.
 */
export type ChipProjectionProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;

/** What every chip arm receives beside its key: the dispatcher's native props. */
export type ChipArmNative = Omit<ChipProjectionProps, "node">;
