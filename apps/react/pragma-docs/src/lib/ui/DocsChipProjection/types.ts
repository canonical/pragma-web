// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ChipArmNative } from "@canonical/prism-projections";
import type { DocsChipProjection_node$key } from "../../../relay/__generated__/DocsChipProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...DocsChipProjection_node`.
   */
  readonly node: DocsChipProjection_node$key;
};

/**
 * Props accepted by `DocsChipProjection`, which
 * renders no element of its own: its node, then what the package's
 * `ChipProjection` hands every arm.
 */
export type DocsChipProjectionProps = OwnProps & ChipArmNative;
