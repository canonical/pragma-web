// Scaffolded by @canonical/summon-component:react v0.43.0

import type { SiteChipSlot_node$key } from "#relay/__generated__/SiteChipSlot_node.graphql.js";
import type { DocsChipProjectionProps } from "../DocsChipProjection/types.js";

/**
 * Props accepted by `SiteChipSlot`, which renders no element of its own:
 * the site slot's key, from the package's chip switch, whose composite
 * spreads `...SiteChipSlot_node`, then every prop `DocsChipProjection`
 * takes but its key.
 */
export type SiteChipSlotProps = Omit<DocsChipProjectionProps, "node"> & {
  readonly node: SiteChipSlot_node$key;
};
