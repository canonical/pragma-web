// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { SiteCardProjection_node$key } from "../../../../relay/__generated__/SiteCardProjection_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the site slot to dispatch, from the package's
   * card dispatcher, whose composite spreads `...SiteCardProjection_node`.
   */
  readonly node: SiteCardProjection_node$key;
  /** The node's typename, the package's dispatch key. */
  readonly typename: string;
};

/**
 * Props accepted by `SiteCardProjection`, which renders no element of its own:
 * its own, then the native props of the `<div>` every card arm renders as its
 * root, without `children`: the arm fills its slots from the node.
 */
export type SiteCardProjectionProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
