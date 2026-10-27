// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { RollingStockCommand_node$key } from "#relay/__generated__/RollingStockCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the RollingStock to render, from an operation that
   * spreads `...RollingStockCommand_node`.
   */
  readonly node: RollingStockCommand_node$key;
};

/**
 * Props accepted by `RollingStockCommand`: its own, then the native props of the
 * `<li>` the EntityCommand renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type RollingStockCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
