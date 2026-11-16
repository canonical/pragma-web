// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CallStop_node$key } from "#relay/__generated__/CallStop_node.graphql.js";

/**
 * The inline channel the stop sets from the graph's data: its line's
 * colour as `"--call-stop-colour"` on the root, through the package's
 * colour gate, so a refused value leaves it unset.
 */
type OwnProps = {
  /**
   * The Relay fragment key of the Call to render, from an operation that
   * spreads `...CallStop_node`.
   */
  readonly node: CallStop_node$key;
  /** The IRI of the line the call belongs to, which its connections leave out. */
  readonly lineUri: string;
  /** The line's colour, a `#rrggbb` triplet from the graph. */
  readonly colour: string;
};

/**
 * Props accepted by `CallStop`: the call, its line and the line's colour,
 * then the native props of its `<li>` root. The native `children` are
 * excluded: the stop renders its slots from its call.
 */
export type CallStopProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
