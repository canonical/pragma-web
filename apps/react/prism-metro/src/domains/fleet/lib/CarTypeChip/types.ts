// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { CarTypeChip_node$key } from "#relay/__generated__/CarTypeChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CarType to render, from an operation that
   * spreads `...CarTypeChip_node`.
   */
  readonly node: CarTypeChip_node$key;
  /** The mention's text, in place of the car type's name. */
  readonly children?: ReactNode;
  /**
   * Whether the mention links to the car type's home and peeks at its card:
   * `false` sets it as inert text, for a mention of the page it sits on.
   */
  readonly linked?: boolean;
};

/**
 * Props accepted by `CarTypeChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type CarTypeChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
