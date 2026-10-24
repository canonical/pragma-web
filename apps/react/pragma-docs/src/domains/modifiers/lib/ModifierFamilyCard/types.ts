// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { ModifierFamilyCard_node$key } from "../../../../relay/__generated__/ModifierFamilyCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the ModifierFamily to render, from an operation
   * that spreads `...ModifierFamilyCard_node`.
   */
  readonly node: ModifierFamilyCard_node$key;
};

/**
 * Props accepted by `ModifierFamilyCard`: its own, then the native props of the
 * `<div>` the card renders as its root. The native `children` are
 * excluded: the projection fills the card's slots from the family.
 */
export type ModifierFamilyCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
