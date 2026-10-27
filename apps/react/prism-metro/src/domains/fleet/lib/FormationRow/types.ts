// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { FormationRow_node$key } from "#relay/__generated__/FormationRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Formation to render, from an operation that
   * spreads `...FormationRow_node`.
   */
  readonly node: FormationRow_node$key;
};

/**
 * Props accepted by `FormationRow`: its own, then the native props of the
 * `<li>` the EntityRow renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type FormationRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
