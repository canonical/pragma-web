// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { InterchangeRow_node$key } from "../../../../relay/__generated__/InterchangeRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Interchange to render, from an operation that
   * spreads `...InterchangeRow_node`.
   */
  readonly node: InterchangeRow_node$key;
};

/**
 * Props accepted by `InterchangeRow`: its own, then the native props of the
 * `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the interchange.
 */
export type InterchangeRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
