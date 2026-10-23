// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { OntologyPropertyCard_node$key } from "../../../__generated__/OntologyPropertyCard_node.graphql.js";

type OwnProps = {
  /** The Relay fragment key of the OntologyProperty to render, from an operation that spreads `...OntologyPropertyCard_node`. */
  readonly node: OntologyPropertyCard_node$key;
};

/**
 * Props accepted by `OntologyPropertyCard`: its own, then the native props
 * of the `<div>` the card renders as its root. The native `children` are
 * excluded: the projection fills the card's slots from the property.
 */
export type OntologyPropertyCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
