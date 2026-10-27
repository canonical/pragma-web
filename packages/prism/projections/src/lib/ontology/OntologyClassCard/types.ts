// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { OntologyClassCard_node$key } from "../../../__generated__/OntologyClassCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the OntologyClass to render, from an operation
   * that spreads `...OntologyClassCard_node`.
   */
  readonly node: OntologyClassCard_node$key;
};

/**
 * Props accepted by `OntologyClassCard`: its own, then the native props of
 * the `<div>` the card renders as its root. The native `children` are
 * excluded: the projection fills the card's slots from the class.
 */
export type OntologyClassCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
