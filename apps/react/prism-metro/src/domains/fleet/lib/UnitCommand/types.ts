// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { UnitCommand_node$key } from "#relay/__generated__/UnitCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Unit to render, from an operation that
   * spreads `...UnitCommand_node`.
   */
  readonly node: UnitCommand_node$key;
};

/**
 * Props accepted by `UnitCommand`: its own, then the native props of the
 * `<li>` the EntityCommand renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type UnitCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
