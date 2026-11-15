// Scaffolded by @canonical/summon-component:react v0.43.0

import type { SiteGraphNodeSlot_node$key } from "#relay/__generated__/SiteGraphNodeSlot_node.graphql.js";
import type { MetroGraphNodeProjectionProps } from "../MetroGraphNodeProjection/types.js";

/**
 * Props accepted by `SiteGraphNodeSlot`, which renders no element of its own:
 * the site slot's key, from the package's graph node switch, whose composite
 * spreads `...SiteGraphNodeSlot_node`, then every prop `MetroGraphNodeProjection`
 * takes but its key.
 */
export type SiteGraphNodeSlotProps = Omit<
  MetroGraphNodeProjectionProps,
  "node"
> & {
  readonly node: SiteGraphNodeSlot_node$key;
};
