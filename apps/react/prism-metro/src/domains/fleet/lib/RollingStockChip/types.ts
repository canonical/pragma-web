// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { RollingStockChip_node$key } from "#relay/__generated__/RollingStockChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the RollingStock to render, from an operation that
   * spreads `...RollingStockChip_node`.
   */
  readonly node: RollingStockChip_node$key;
  /** The mention's text, in place of the rolling stock's name. */
  readonly children?: ReactNode;
  /**
   * Whether the mention links to the rolling stock's home and peeks at its card:
   * `false` sets it as inert text, for a mention of the page it sits on.
   */
  readonly linked?: boolean;
};

/**
 * Props accepted by `RollingStockChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type RollingStockChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
