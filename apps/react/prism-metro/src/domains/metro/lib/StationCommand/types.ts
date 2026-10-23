// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { StationCommand_node$key } from "../../../../relay/__generated__/StationCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Station to render, from an operation that
   * spreads `...StationCommand_node`.
   */
  readonly node: StationCommand_node$key;
};

/**
 * Props accepted by `StationCommand`: its own, then the native props of the
 * `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the station.
 */
export type StationCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
