// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CarTypeCommand_node$key } from "#relay/__generated__/CarTypeCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CarType to render, from an operation that
   * spreads `...CarTypeCommand_node`.
   */
  readonly node: CarTypeCommand_node$key;
};

/**
 * Props accepted by `CarTypeCommand`: its own, then the native props of the
 * `<li>` the EntityCommand renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type CarTypeCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
