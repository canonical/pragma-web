// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { OntologyPropertyChip_node$key } from "../../../__generated__/OntologyPropertyChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the OntologyProperty to render, from an operation
   * that spreads `...OntologyPropertyChip_node`.
   */
  readonly node: OntologyPropertyChip_node$key;
  /** The mention's text, in place of the property's name. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `OntologyPropertyChip`: its own, then the native props
 * of the `<span>` the chip renders as its root.
 */
export type OntologyPropertyChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
