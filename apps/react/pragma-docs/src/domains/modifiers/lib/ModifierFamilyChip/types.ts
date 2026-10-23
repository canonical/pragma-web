// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { ModifierFamilyChip_node$key } from "../../../../relay/__generated__/ModifierFamilyChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the ModifierFamily to render, from an operation
   * that spreads `...ModifierFamilyChip_node`.
   */
  readonly node: ModifierFamilyChip_node$key;
  /** The mention's text, in place of the family's title. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `ModifierFamilyChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type ModifierFamilyChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
