// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { RollingStockCard_node$key } from "#relay/__generated__/RollingStockCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the RollingStock to render, from an operation that
   * spreads `...RollingStockCard_node`.
   */
  readonly node: RollingStockCard_node$key;
};

/**
 * Props accepted by `RollingStockCard`: its own, then the native props of the
 * `<div>` the EntityCard renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type RollingStockCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
