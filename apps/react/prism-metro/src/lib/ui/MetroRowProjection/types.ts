// Scaffolded by @canonical/summon-component:react v0.43.0

import type { RowArmNative } from "@canonical/prism-projections";
import type { MetroRowProjection_node$key } from "#relay/__generated__/MetroRowProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...MetroRowProjection_node`.
   */
  readonly node: MetroRowProjection_node$key;
};

/**
 * Props accepted by `MetroRowProjection`, which
 * renders no element of its own: its node, then what the package's
 * `RowProjection` hands every arm.
 */
export type MetroRowProjectionProps = OwnProps & RowArmNative;
