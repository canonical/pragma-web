// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { OntologyClassRow_node$key } from "../../../__generated__/OntologyClassRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the OntologyClass to render, from an operation
   * that spreads `...OntologyClassRow_node`.
   */
  readonly node: OntologyClassRow_node$key;
};

/**
 * Props accepted by `OntologyClassRow`: its own, then the native props of
 * the `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the class.
 */
export type OntologyClassRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
