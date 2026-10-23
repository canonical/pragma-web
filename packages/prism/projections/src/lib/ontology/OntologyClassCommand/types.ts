// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { OntologyClassCommand_node$key } from "../../../__generated__/OntologyClassCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the OntologyClass to render, from an operation
   * that spreads `...OntologyClassCommand_node`.
   */
  readonly node: OntologyClassCommand_node$key;
};

/**
 * Props accepted by `OntologyClassCommand`: its own, then the native props
 * of the `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the class.
 */
export type OntologyClassCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
