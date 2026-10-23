// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ZoneCommand_node$key } from "../../../../relay/__generated__/ZoneCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Zone to render, from an operation that
   * spreads `...ZoneCommand_node`.
   */
  readonly node: ZoneCommand_node$key;
};

/**
 * Props accepted by `ZoneCommand`: its own, then the native props of the
 * `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the zone.
 */
export type ZoneCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
