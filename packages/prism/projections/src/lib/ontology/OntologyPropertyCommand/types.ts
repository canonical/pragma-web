// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { OntologyPropertyCommand_node$key } from "../../../__generated__/OntologyPropertyCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the OntologyProperty to render, from an operation
   * that spreads `...OntologyPropertyCommand_node`.
   */
  readonly node: OntologyPropertyCommand_node$key;
};

/**
 * Props accepted by `OntologyPropertyCommand`: its own, then the native
 * props of the `<li>` the result renders as its root. The native
 * `children` are excluded: the projection fills the result's slots from
 * the property.
 */
export type OntologyPropertyCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
