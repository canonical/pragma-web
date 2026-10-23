// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { StationRow_node$key } from "../../../../relay/__generated__/StationRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Station to render, from an operation that
   * spreads `...StationRow_node`.
   */
  readonly node: StationRow_node$key;
};

/**
 * Props accepted by `StationRow`: its own, then the native props of the
 * `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the station.
 */
export type StationRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
