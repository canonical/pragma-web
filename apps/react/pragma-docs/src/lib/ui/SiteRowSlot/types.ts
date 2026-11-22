// Scaffolded by @canonical/summon-component:react v0.43.0

import type { SiteRowSlot_node$key } from "#relay/__generated__/SiteRowSlot_node.graphql.js";
import type { DocsRowProjectionProps } from "../DocsRowProjection/types.js";

/**
 * Props accepted by `SiteRowSlot`, which renders no element of its own:
 * the site slot's key, from the package's row switch, whose composite
 * spreads `...SiteRowSlot_node`, then every prop `DocsRowProjection`
 * takes but its key.
 */
export type SiteRowSlotProps = Omit<DocsRowProjectionProps, "node"> & {
  readonly node: SiteRowSlot_node$key;
};
