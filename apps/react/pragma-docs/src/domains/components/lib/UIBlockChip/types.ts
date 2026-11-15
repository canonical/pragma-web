// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { UIBlockChip_node$key } from "../../../../relay/__generated__/UIBlockChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the UIBlock to render, from an operation
   * that spreads `...UIBlockChip_node`.
   */
  readonly node: UIBlockChip_node$key;
  /** The mention's text, in place of the block's title. */
  readonly children?: ReactNode;
  /**
   * Whether the mention links to the block's home and peeks at its card:
   * `false` sets it as inert text, for a mention of the page it sits on.
   */
  readonly linked?: boolean;
};

/**
 * Props accepted by `UIBlockChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type UIBlockChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
