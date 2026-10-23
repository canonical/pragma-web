// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { LineCard_node$key } from "../../../../relay/__generated__/LineCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Line to render, from an operation that
   * spreads `...LineCard_node`.
   */
  readonly node: LineCard_node$key;
};

/**
 * Props accepted by `LineCard`: its own, then the native props of the
 * `<div>` the card renders as its root. The native `children` are
 * excluded: the projection fills the card's slots from the line.
 */
export type LineCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
