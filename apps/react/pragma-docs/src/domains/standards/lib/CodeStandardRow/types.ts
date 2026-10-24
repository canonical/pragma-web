// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CodeStandardRow_node$key } from "../../../../relay/__generated__/CodeStandardRow_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the CodeStandard to render, from an operation
   * that spreads `...CodeStandardRow_node`.
   */
  readonly node: CodeStandardRow_node$key;
};

/**
 * Props accepted by `CodeStandardRow`: its own, then the native props of the
 * `<li>` the entry renders as its root. The native `children` are
 * excluded: the projection fills the entry's slots from the standard.
 */
export type CodeStandardRowProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children">;
