// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { RouteStrip_node$key } from "#relay/__generated__/RouteStrip_node.graphql.js";

/**
 * The inline channel the strip sets from the graph's data: the line's
 * colour as `"--route-strip-colour"` on the root.
 */
type OwnProps = {
  /**
   * The Relay fragment key of the Route to render, from an operation that
   * spreads `...RouteStrip_node`.
   */
  readonly node: RouteStrip_node$key;
  /** The IRI of the route's line, which its stops' connections leave out. */
  readonly lineUri: string;
  /** The line's colour, a `#rrggbb` triplet from the graph. */
  readonly colour: string;
};

/**
 * Props accepted by `RouteStrip`: the route, its line and the line's
 * colour, then the native props of its `<section>` root. The native
 * `children` are excluded: the strip renders its calls.
 */
export type RouteStripProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
