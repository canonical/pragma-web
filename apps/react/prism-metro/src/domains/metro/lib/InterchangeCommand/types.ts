// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { InterchangeCommand_node$key } from "#relay/__generated__/InterchangeCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Interchange to render, from an operation that
   * spreads `...InterchangeCommand_node`.
   */
  readonly node: InterchangeCommand_node$key;
};

/**
 * Props accepted by `InterchangeCommand`: its own, then the native props of the
 * `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the interchange.
 */
export type InterchangeCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
