// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { LineChip_node$key } from "#relay/__generated__/LineChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Line to render, from an operation that
   * spreads `...LineChip_node`.
   */
  readonly node: LineChip_node$key;
  /** The mention's text, in place of the line's name. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `LineChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type LineChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
