// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { SiteChipProjection_node$key } from "../../../../relay/__generated__/SiteChipProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the site slot to dispatch, from the package's
   * chip dispatcher, whose composite spreads `...SiteChipProjection_node`.
   */
  readonly node: SiteChipProjection_node$key;
  /** The node's typename, the package's dispatch key. */
  readonly typename: string;
  /** The mention's text, in place of the node's own name. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `SiteChipProjection`, which renders no element of its own:
 * its own, then the native props of the `<span>` every chip arm renders as its
 * root.
 */
export type SiteChipProjectionProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
