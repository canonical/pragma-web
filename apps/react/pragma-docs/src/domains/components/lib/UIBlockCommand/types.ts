// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { UIBlockCommand_node$key } from "../../../../relay/__generated__/UIBlockCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the UIBlock to render, from an operation
   * that spreads `...UIBlockCommand_node`.
   */
  readonly node: UIBlockCommand_node$key;
};

/**
 * Props accepted by `UIBlockCommand`: its own, then the native props of the
 * `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the block.
 */
export type UIBlockCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
