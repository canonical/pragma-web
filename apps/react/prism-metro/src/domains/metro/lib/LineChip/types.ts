// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { LineChip_node$key } from "#relay/__generated__/LineChip_node.graphql.js";

/**
 * The custom property `styles.css` reads the line's colour from, set on the
 * chip's root per line: the swatch in the chip's mark paints with it.
 */
export interface LineChipChannelStyle {
  /** The line's colour, the `#rrggbb` the graph gives it. */
  readonly "--line-chip-swatch-color": string;
}

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
