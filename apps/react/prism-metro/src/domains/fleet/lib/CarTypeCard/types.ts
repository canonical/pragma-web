// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CarTypeCard_node$key } from "#relay/__generated__/CarTypeCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CarType to render, from an operation that
   * spreads `...CarTypeCard_node`.
   */
  readonly node: CarTypeCard_node$key;
};

/**
 * Props accepted by `CarTypeCard`: its own, then the native props of the
 * `<div>` the EntityCard renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type CarTypeCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
