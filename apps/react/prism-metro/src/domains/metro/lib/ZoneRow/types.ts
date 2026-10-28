// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ZoneRow_node$key } from "#relay/__generated__/ZoneRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Zone to render, from an operation that
   * spreads `...ZoneRow_node`.
   */
  readonly node: ZoneRow_node$key;
};

/**
 * Props accepted by `ZoneRow`: its own, then the native props of the
 * `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the zone.
 */
export type ZoneRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
