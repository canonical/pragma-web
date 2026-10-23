// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { LineRow_node$key } from "../../../../relay/__generated__/LineRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Line to render, from an operation that
   * spreads `...LineRow_node`.
   */
  readonly node: LineRow_node$key;
};

/**
 * Props accepted by `LineRow`: its own, then the native props of the
 * `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the line.
 */
export type LineRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
