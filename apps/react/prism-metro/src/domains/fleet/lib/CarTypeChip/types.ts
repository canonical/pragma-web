// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { CarTypeChip_node$key } from "#relay/__generated__/CarTypeChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CarType to render, from an operation that
   * spreads `...CarTypeChip_node`.
   */
  readonly node: CarTypeChip_node$key;
  /** What the pill reads instead of the name, when given. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `CarTypeChip`: its own, then the native props of the
 * `<span>` the EntityChip renders as its root.
 */
export type CarTypeChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
