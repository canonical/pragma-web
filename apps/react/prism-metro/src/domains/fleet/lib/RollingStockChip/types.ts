// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { RollingStockChip_node$key } from "#relay/__generated__/RollingStockChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the RollingStock to render, from an operation that
   * spreads `...RollingStockChip_node`.
   */
  readonly node: RollingStockChip_node$key;
  /** What the pill reads instead of the name, when given. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `RollingStockChip`: its own, then the native props of the
 * `<span>` the EntityChip renders as its root.
 */
export type RollingStockChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
