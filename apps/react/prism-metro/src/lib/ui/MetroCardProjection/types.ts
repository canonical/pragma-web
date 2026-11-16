// Scaffolded by @canonical/summon-component:react v0.43.0

import type { CardArmNative } from "@canonical/prism-projections";
import type { MetroCardProjection_node$key } from "#relay/__generated__/MetroCardProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...MetroCardProjection_node`.
   */
  readonly node: MetroCardProjection_node$key;
};

/**
 * Props accepted by `MetroCardProjection`, which
 * renders no element of its own: its node, then what the package's
 * `CardProjection` hands every arm.
 */
export type MetroCardProjectionProps = OwnProps & CardArmNative;
