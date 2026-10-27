// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { OntologyClassGraphNode_node$key } from "../../../__generated__/OntologyClassGraphNode_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the OntologyClass to render, from an operation
   * that spreads `...OntologyClassGraphNode_node`.
   */
  readonly node: OntologyClassGraphNode_node$key;
  /** The node's width in SVG user units; the graph's layout decides it. */
  readonly width?: number;
  /** The node's height in SVG user units; the graph's layout decides it. */
  readonly height?: number;
};

/**
 * Props accepted by `OntologyClassGraphNode`: its own, then the native
 * props of the SVG `<g>` the graph node renders as its root. The native
 * `children` are excluded: the projection fills the node's slots from the
 * class.
 */
export type OntologyClassGraphNodeProps = OwnProps &
  Omit<ComponentProps<"g">, keyof OwnProps | "children">;
