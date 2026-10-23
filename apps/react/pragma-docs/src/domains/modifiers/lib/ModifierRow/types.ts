// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ModifierRow_node$key } from "../../../../relay/__generated__/ModifierRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Modifier to render, from an operation
   * that spreads `...ModifierRow_node`.
   */
  readonly node: ModifierRow_node$key;
};

/**
 * Props accepted by `ModifierRow`: its own, then the native props of the
 * `<li>` the entry renders as its root. The native `children` are
 * excluded: the projection fills the entry's slots from the modifier.
 */
export type ModifierRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
