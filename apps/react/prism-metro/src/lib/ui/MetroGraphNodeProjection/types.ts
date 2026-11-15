// Scaffolded by @canonical/summon-component:react v0.43.0

import type { GraphNodeArmNative } from "@canonical/prism-projections";
import type { MetroGraphNodeProjection_node$key } from "#relay/__generated__/MetroGraphNodeProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...MetroGraphNodeProjection_node`.
   */
  readonly node: MetroGraphNodeProjection_node$key;
};

/**
 * Props accepted by `MetroGraphNodeProjection`, which
 * renders no element of its own: its node, then what the package's
 * `GraphNodeProjection` hands every arm.
 */
export type MetroGraphNodeProjectionProps = OwnProps & GraphNodeArmNative;
