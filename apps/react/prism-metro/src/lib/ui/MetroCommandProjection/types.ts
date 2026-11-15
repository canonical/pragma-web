// Scaffolded by @canonical/summon-component:react v0.43.0

import type { CommandArmNative } from "@canonical/prism-projections";
import type { MetroCommandProjection_node$key } from "#relay/__generated__/MetroCommandProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...MetroCommandProjection_node`.
   */
  readonly node: MetroCommandProjection_node$key;
};

/**
 * Props accepted by `MetroCommandProjection`, which
 * renders no element of its own: its node, then what the package's
 * `CommandProjection` hands every arm.
 */
export type MetroCommandProjectionProps = OwnProps & CommandArmNative;
