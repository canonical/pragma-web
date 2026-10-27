// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { LineCommand_node$key } from "#relay/__generated__/LineCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Line to render, from an operation that
   * spreads `...LineCommand_node`.
   */
  readonly node: LineCommand_node$key;
};

/**
 * Props accepted by `LineCommand`: its own, then the native props of the
 * `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the line.
 */
export type LineCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
