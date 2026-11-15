// Scaffolded by @canonical/summon-component:react v0.43.0

import type { SiteCardSlot_node$key } from "#relay/__generated__/SiteCardSlot_node.graphql.js";
import type { MetroCardProjectionProps } from "../MetroCardProjection/types.js";

/**
 * Props accepted by `SiteCardSlot`, which renders no element of its own:
 * the site slot's key, from the package's card switch, whose composite
 * spreads `...SiteCardSlot_node`, then every prop `MetroCardProjection`
 * takes but its key.
 */
export type SiteCardSlotProps = Omit<MetroCardProjectionProps, "node"> & {
  readonly node: SiteCardSlot_node$key;
};
