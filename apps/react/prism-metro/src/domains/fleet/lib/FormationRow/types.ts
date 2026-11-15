// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { FormationRow_node$key } from "#relay/__generated__/FormationRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Formation to render, from an operation that
   * spreads `...FormationRow_node`.
   */
  readonly node: FormationRow_node$key;
  /**
   * How many lines the row takes: `"two"` sets its summary under its
   * title, for an index that opts in.
   */
  readonly lines?: "one" | "two";
};

/**
 * Props accepted by `FormationRow`: its own, then the native props of the
 * `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the formation.
 */
export type FormationRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
