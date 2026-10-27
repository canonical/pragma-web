// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { StationChip_node$key } from "#relay/__generated__/StationChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Station to render, from an operation that
   * spreads `...StationChip_node`.
   */
  readonly node: StationChip_node$key;
  /** The mention's text, in place of the station's name. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `StationChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type StationChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
