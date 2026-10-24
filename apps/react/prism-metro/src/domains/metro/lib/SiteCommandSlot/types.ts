// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { SiteCommandSlot_node$key } from "#relay/__generated__/SiteCommandSlot_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the site slot to dispatch, from the package's
   * command dispatcher, whose composite spreads `...SiteCommandSlot_node`.
   */
  readonly node: SiteCommandSlot_node$key;
  /** The node's typename, the package's dispatch key. */
  readonly typename: string;
};

/**
 * Props accepted by `SiteCommandSlot`, which
 * renders no element of its own: its own, then the native props of the
 * `<li>` every command arm renders as its root, without `children`: the arm
 * fills its slots from the node.
 */
export type SiteCommandSlotProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
