// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ChipArmNative } from "@canonical/prism-projections";
import type { MetroChipProjection_node$key } from "#relay/__generated__/MetroChipProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...MetroChipProjection_node`.
   */
  readonly node: MetroChipProjection_node$key;
};

/**
 * Props accepted by `MetroChipProjection`, which
 * renders no element of its own: its node, then what the package's
 * `ChipProjection` hands every arm.
 */
export type MetroChipProjectionProps = OwnProps & ChipArmNative;
