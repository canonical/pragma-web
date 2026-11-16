// Scaffolded by @canonical/summon-component:react v0.43.0

import type { RowArmNative } from "@canonical/prism-projections";
import type { DocsRowProjection_node$key } from "../../../relay/__generated__/DocsRowProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to dispatch, from an operation that
   * spreads `...DocsRowProjection_node`.
   */
  readonly node: DocsRowProjection_node$key;
};

/**
 * Props accepted by `DocsRowProjection`, which
 * renders no element of its own: its node, then what the package's
 * `RowProjection` hands every arm.
 */
export type DocsRowProjectionProps = OwnProps & RowArmNative;
