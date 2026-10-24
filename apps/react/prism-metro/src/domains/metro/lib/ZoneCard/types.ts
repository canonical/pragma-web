// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ZoneCard_node$key } from "#relay/__generated__/ZoneCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Zone to render, from an operation that
   * spreads `...ZoneCard_node`.
   */
  readonly node: ZoneCard_node$key;
};

/**
 * Props accepted by `ZoneCard`: its own, then the native props of the
 * `<div>` the card renders as its root. The native `children` are
 * excluded: the projection fills the card's slots from the zone.
 */
export type ZoneCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
