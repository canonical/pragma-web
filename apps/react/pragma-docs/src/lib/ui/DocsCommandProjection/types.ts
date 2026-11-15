// Scaffolded by @canonical/summon-component:react v0.43.0

import type { CommandArmNative } from "@canonical/prism-projections";
import type { DocsCommandProjection_node$key } from "../../../relay/__generated__/DocsCommandProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...DocsCommandProjection_node`.
   */
  readonly node: DocsCommandProjection_node$key;
};

/**
 * Props accepted by `DocsCommandProjection`, which
 * renders no element of its own: its node, then what the package's
 * `CommandProjection` hands every arm.
 */
export type DocsCommandProjectionProps = OwnProps & CommandArmNative;
