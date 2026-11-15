// Scaffolded by @canonical/summon-component:react v0.43.0

import type { CardArmNative } from "@canonical/prism-projections";
import type { DocsCardProjection_node$key } from "../../../relay/__generated__/DocsCardProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...DocsCardProjection_node`.
   */
  readonly node: DocsCardProjection_node$key;
};

/**
 * Props accepted by `DocsCardProjection`, which
 * renders no element of its own: its node, then what the package's
 * `CardProjection` hands every arm.
 */
export type DocsCardProjectionProps = OwnProps & CardArmNative;
