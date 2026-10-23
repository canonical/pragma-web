// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { OntologyClassChip_node$key } from "../../../__generated__/OntologyClassChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the OntologyClass to render, from an operation
   * that spreads `...OntologyClassChip_node`.
   */
  readonly node: OntologyClassChip_node$key;
  /** The mention's text, in place of the class's title. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `OntologyClassChip`: its own, then the native props of
 * the `<span>` the chip renders as its root.
 */
export type OntologyClassChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
