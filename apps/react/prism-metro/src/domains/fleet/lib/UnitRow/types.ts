// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { UnitRow_node$key } from "#relay/__generated__/UnitRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Unit to render, from an operation that
   * spreads `...UnitRow_node`.
   */
  readonly node: UnitRow_node$key;
};

/**
 * Props accepted by `UnitRow`: its own, then the native props of the
 * `<li>` the EntityRow renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type UnitRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
