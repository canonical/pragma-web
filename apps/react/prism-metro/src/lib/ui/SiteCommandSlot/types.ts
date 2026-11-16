// Scaffolded by @canonical/summon-component:react v0.43.0

import type { SiteCommandSlot_node$key } from "#relay/__generated__/SiteCommandSlot_node.graphql.js";
import type { MetroCommandProjectionProps } from "../MetroCommandProjection/types.js";

/**
 * Props accepted by `SiteCommandSlot`, which renders no element of its own:
 * the site slot's key, from the package's command switch, whose composite
 * spreads `...SiteCommandSlot_node`, then every prop `MetroCommandProjection`
 * takes but its key.
 */
export type SiteCommandSlotProps = Omit<MetroCommandProjectionProps, "node"> & {
  readonly node: SiteCommandSlot_node$key;
};
