// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { UIBlockRow_node$key } from "../../../../relay/__generated__/UIBlockRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the UIBlock to render, from an operation
   * that spreads `...UIBlockRow_node`.
   */
  readonly node: UIBlockRow_node$key;
};

/**
 * Props accepted by `UIBlockRow`: its own, then the native props of the
 * `<li>` the entry renders as its root. The native `children` are
 * excluded: the projection fills the entry's slots from the block.
 */
export type UIBlockRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
