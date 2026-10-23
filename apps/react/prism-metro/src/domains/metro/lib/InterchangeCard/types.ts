// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { InterchangeCard_node$key } from "../../../../relay/__generated__/InterchangeCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Interchange to render, from an operation that
   * spreads `...InterchangeCard_node`.
   */
  readonly node: InterchangeCard_node$key;
};

/**
 * Props accepted by `InterchangeCard`: its own, then the native props of the
 * `<div>` the card renders as its root. The native `children` are
 * excluded: the projection fills the card's slots from the interchange.
 */
export type InterchangeCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
