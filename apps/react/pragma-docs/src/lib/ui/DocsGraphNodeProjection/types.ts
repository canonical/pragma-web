// Scaffolded by @canonical/summon-component:react v0.43.0

import type { GraphNodeArmNative } from "@canonical/prism-projections";
import type { DocsGraphNodeProjection_node$key } from "../../../relay/__generated__/DocsGraphNodeProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...DocsGraphNodeProjection_node`.
   */
  readonly node: DocsGraphNodeProjection_node$key;
};

/**
 * Props accepted by `DocsGraphNodeProjection`, which
 * renders no element of its own: its node, then what the package's
 * `GraphNodeProjection` hands every arm.
 */
export type DocsGraphNodeProjectionProps = OwnProps & GraphNodeArmNative;
