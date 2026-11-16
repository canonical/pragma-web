// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { RollingStockRow_node$key } from "#relay/__generated__/RollingStockRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the RollingStock to render, from an operation that
   * spreads `...RollingStockRow_node`.
   */
  readonly node: RollingStockRow_node$key;
  /**
   * How many lines the row takes: `"two"` sets its summary under its
   * title, for an index that opts in.
   */
  readonly lines?: "one" | "two";
};

/**
 * Props accepted by `RollingStockRow`: its own, then the native props of the
 * `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the rolling stock.
 */
export type RollingStockRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
