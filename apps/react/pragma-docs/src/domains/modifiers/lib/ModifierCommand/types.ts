// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ModifierCommand_node$key } from "../../../../relay/__generated__/ModifierCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Modifier to render, from an operation
   * that spreads `...ModifierCommand_node`.
   */
  readonly node: ModifierCommand_node$key;
};

/**
 * Props accepted by `ModifierCommand`: its own, then the native props of the
 * `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the modifier.
 */
export type ModifierCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
