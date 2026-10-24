// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CodeStandardCommand_node$key } from "../../../../relay/__generated__/CodeStandardCommand_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CodeStandard to render, from an operation
   * that spreads `...CodeStandardCommand_node`.
   */
  readonly node: CodeStandardCommand_node$key;
};

/**
 * Props accepted by `CodeStandardCommand`: its own, then the native props of
 * the `<li>` the result renders as its root. The native `children` are
 * excluded: the projection fills the result's slots from the standard.
 */
export type CodeStandardCommandProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
