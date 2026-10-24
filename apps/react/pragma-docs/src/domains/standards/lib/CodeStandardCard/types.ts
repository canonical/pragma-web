// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CodeStandardCard_node$key } from "../../../../relay/__generated__/CodeStandardCard_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CodeStandard to render, from an operation
   * that spreads `...CodeStandardCard_node`.
   */
  readonly node: CodeStandardCard_node$key;
};

/**
 * Props accepted by `CodeStandardCard`: its own, then the native props of the
 * `<div>` the card renders as its root. The native `children` are
 * excluded: the projection fills the card's slots from the standard.
 */
export type CodeStandardCardProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
