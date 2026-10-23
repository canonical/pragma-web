// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { OntologyPropertyRow_node$key } from "../../../__generated__/OntologyPropertyRow_node.graphql.js";

type OwnProps = {
  /** The Relay fragment key of the OntologyProperty to render, from an operation that spreads `...OntologyPropertyRow_node`. */
  readonly node: OntologyPropertyRow_node$key;
};

/**
 * Props accepted by `OntologyPropertyRow`: its own, then the native props
 * of the `<li>` the row renders as its root. The native `children` are
 * excluded: the projection fills the row's slots from the property.
 */
export type OntologyPropertyRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
