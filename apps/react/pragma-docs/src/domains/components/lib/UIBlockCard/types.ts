// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { UIBlockCard_node$key } from "../../../../relay/__generated__/UIBlockCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the UIBlock to render, from an operation
   * that spreads `...UIBlockCard_node`.
   */
  readonly node: UIBlockCard_node$key;
};

/**
 * Props accepted by `UIBlockCard`: its own, then the native props of the
 * `<div>` the card renders as its root. The native `children` are
 * excluded: the projection fills the card's slots from the block.
 */
export type UIBlockCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
