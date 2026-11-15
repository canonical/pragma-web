// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ModifierRow_node$key } from "../../../../relay/__generated__/ModifierRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Modifier to render, from an operation
   * that spreads `...ModifierRow_node`.
   */
  readonly node: ModifierRow_node$key;
  /**
   * How many lines the row takes: one (32px) by default, or two (56px),
   * the modifier's summary under its title, where an index opts in.
   */
  readonly lines?: "one" | "two";
};

/**
 * Props accepted by `ModifierRow`: its own, then the native props of the
 * `<li>` the entry renders as its root. The native `children` are
 * excluded: the projection fills the entry's slots from the modifier.
 */
export type ModifierRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
