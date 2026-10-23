// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { SiteCommandProjection_node$key } from "../../../relay/__generated__/SiteCommandProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...SiteCommandProjection_node`.
   */
  readonly node: SiteCommandProjection_node$key;
};

/**
 * Props accepted by `SiteCommandProjection`, a dispatcher that
 * renders no element of its own: its own, then the native props of the `<li>`
 * every command arm renders as its root, without `children`: the arm fills its
 * slots from the node.
 */
export type SiteCommandProjectionProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
