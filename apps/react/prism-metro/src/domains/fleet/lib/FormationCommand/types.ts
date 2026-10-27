// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { FormationCommand_node$key } from "#relay/__generated__/FormationCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Formation to render, from an operation that
   * spreads `...FormationCommand_node`.
   */
  readonly node: FormationCommand_node$key;
};

/**
 * Props accepted by `FormationCommand`: its own, then the native props of the
 * `<li>` the EntityCommand renders as its root. The native `children` are
 * excluded: the projection fills its slots from the node.
 */
export type FormationCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
