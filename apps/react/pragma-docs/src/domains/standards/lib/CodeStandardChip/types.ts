// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { CodeStandardChip_node$key } from "../../../../relay/__generated__/CodeStandardChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CodeStandard to render, from an operation
   * that spreads `...CodeStandardChip_node`.
   */
  readonly node: CodeStandardChip_node$key;
  /** The mention's text, in place of the standard's title. */
  readonly children?: ReactNode;
};

/**
 * Props accepted by `CodeStandardChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type CodeStandardChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
