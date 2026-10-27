// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { FormationCard_node$key } from "#relay/__generated__/FormationCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Formation to render, from an operation that
   * spreads `...FormationCard_node`.
   */
  readonly node: FormationCard_node$key;
};

/**
 * Props accepted by `FormationCard`: its own, then the native props of the
 * `<div>` the EntityCard renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type FormationCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
