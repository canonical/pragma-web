// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ModifierFamilyRow_node$key } from "../../../../relay/__generated__/ModifierFamilyRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the ModifierFamily to render, from an operation
   * that spreads `...ModifierFamilyRow_node`.
   */
  readonly node: ModifierFamilyRow_node$key;
};

/**
 * Props accepted by `ModifierFamilyRow`: its own, then the native props of the
 * `<li>` the entry renders as its root. The native `children` are
 * excluded: the projection fills the entry's slots from the family.
 */
export type ModifierFamilyRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
