// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { ModifierChip_node$key } from "../../../../relay/__generated__/ModifierChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Modifier to render, from an operation
   * that spreads `...ModifierChip_node`.
   */
  readonly node: ModifierChip_node$key;
  /** The mention's text, in place of the modifier's title. */
  readonly children?: ReactNode;
  /**
   * Whether the mention links to the modifier's home and peeks at its
   * card: `false` sets it as inert text, for a mention of the page it sits
   * on.
   */
  readonly linked?: boolean;
};

/**
 * Props accepted by `ModifierChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type ModifierChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
