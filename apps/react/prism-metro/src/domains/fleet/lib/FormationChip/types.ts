// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { FormationChip_node$key } from "#relay/__generated__/FormationChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Formation to render, from an operation that
   * spreads `...FormationChip_node`.
   */
  readonly node: FormationChip_node$key;
  /** What the pill reads instead of the name, when given. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `FormationChip`: its own, then the native props of the
 * `<span>` the EntityChip renders as its root.
 */
export type FormationChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
