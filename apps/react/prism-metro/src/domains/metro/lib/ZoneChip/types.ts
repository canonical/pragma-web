// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { ZoneChip_node$key } from "../../../../relay/__generated__/ZoneChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Zone to render, from an operation that
   * spreads `...ZoneChip_node`.
   */
  readonly node: ZoneChip_node$key;
  /** The mention's text, in place of the zone's name. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `ZoneChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type ZoneChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
