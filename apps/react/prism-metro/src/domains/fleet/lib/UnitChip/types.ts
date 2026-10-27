// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { UnitChip_node$key } from "#relay/__generated__/UnitChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Unit to render, from an operation that
   * spreads `...UnitChip_node`.
   */
  readonly node: UnitChip_node$key;
  /** What the pill reads instead of the name, when given. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `UnitChip`: its own, then the native props of the
 * `<span>` the EntityChip renders as its root.
 */
export type UnitChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
