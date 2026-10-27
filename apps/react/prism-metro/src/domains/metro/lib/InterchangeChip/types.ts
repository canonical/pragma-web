// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { InterchangeChip_node$key } from "#relay/__generated__/InterchangeChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Interchange to render, from an operation that
   * spreads `...InterchangeChip_node`.
   */
  readonly node: InterchangeChip_node$key;
  /** The mention's text, in place of the interchange's name. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `InterchangeChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type InterchangeChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
