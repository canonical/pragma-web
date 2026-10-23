// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { SiteRowSlot_node$key } from "../../../../relay/__generated__/SiteRowSlot_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the site slot to dispatch, from the package's
   * row dispatcher, whose composite spreads `...SiteRowSlot_node`.
   */
  readonly node: SiteRowSlot_node$key;
  /** The node's typename, the package's dispatch key. */
  readonly typename: string;
};

/**
 * Props accepted by `SiteRowSlot`, which renders no element of its own:
 * its own, then the native props of the `<li>` every row arm renders as its
 * root, without `children`: the arm fills its slots from the node.
 */
export type SiteRowSlotProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
