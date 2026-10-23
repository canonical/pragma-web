// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { OntologyPropertyGraphNode_node$key } from "../../../__generated__/OntologyPropertyGraphNode_node.graphql.js";

type OwnProps = {
  /** The Relay fragment key of the OntologyProperty to render, from an operation that spreads `...OntologyPropertyGraphNode_node`. */
  readonly node: OntologyPropertyGraphNode_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
};

/**
 * Props accepted by `OntologyPropertyGraphNode`: its own, then the native
 * props of the SVG `<g>` the graph node renders as its root. The native
 * `children` are excluded: the projection fills the node's slots from the
 * property.
 */
export type OntologyPropertyGraphNodeProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
