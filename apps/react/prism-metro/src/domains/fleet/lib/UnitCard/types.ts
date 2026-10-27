// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { UnitCard_node$key } from "#relay/__generated__/UnitCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Unit to render, from an operation that
   * spreads `...UnitCard_node`.
   */
  readonly node: UnitCard_node$key;
};

/**
 * Props accepted by `UnitCard`: its own, then the native props of the
 * `<div>` the EntityCard renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type UnitCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
