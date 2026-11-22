// Scaffolded by @canonical/summon-component:react v0.43.0

import type { SiteCommandSlot_node$key } from "#relay/__generated__/SiteCommandSlot_node.graphql.js";
import type { DocsCommandProjectionProps } from "../DocsCommandProjection/types.js";

/**
 * Props accepted by `SiteCommandSlot`, which renders no element of its own:
 * the site slot's key, from the package's command switch, whose composite
 * spreads `...SiteCommandSlot_node`, then every prop `DocsCommandProjection`
 * takes but its key.
 */
export type SiteCommandSlotProps = Omit<DocsCommandProjectionProps, "node"> & {
  readonly node: SiteCommandSlot_node$key;
};
