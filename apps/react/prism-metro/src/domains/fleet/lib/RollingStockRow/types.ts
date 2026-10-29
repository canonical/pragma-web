// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { RollingStockRow_node$key } from "#relay/__generated__/RollingStockRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the RollingStock to render, from an operation that
   * spreads `...RollingStockRow_node`.
   */
  readonly node: RollingStockRow_node$key;
};

/**
 * Props accepted by `RollingStockRow`: its own, then the native props of the
 * `<li>` the EntityRow renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type RollingStockRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
