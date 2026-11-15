// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CarTypeRow_node$key } from "#relay/__generated__/CarTypeRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CarType to render, from an operation that
   * spreads `...CarTypeRow_node`.
   */
  readonly node: CarTypeRow_node$key;
  /**
   * How many lines the row takes: `"two"` sets its summary under its
   * title, for an index that opts in.
   */
  readonly lines?: "one" | "two";
};

/**
 * Props accepted by `CarTypeRow`: its own, then the native props of the
 * `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the car type.
 */
export type CarTypeRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
