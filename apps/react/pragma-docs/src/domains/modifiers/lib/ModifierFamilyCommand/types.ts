// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ModifierFamilyCommand_node$key } from "../../../../relay/__generated__/ModifierFamilyCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the ModifierFamily to render, from an operation
   * that spreads `...ModifierFamilyCommand_node`.
   */
  readonly node: ModifierFamilyCommand_node$key;
};

/**
 * Props accepted by `ModifierFamilyCommand`: its own, then the native props of
 * the `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the family.
 */
export type ModifierFamilyCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
