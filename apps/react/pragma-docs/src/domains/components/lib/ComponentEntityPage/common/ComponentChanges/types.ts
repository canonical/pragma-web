import type { ComponentProps } from "react";
import type { ComponentChanges_node$key } from "#relay/__generated__/ComponentChanges_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the component, from an operation that
   * spreads `...ComponentChanges_node`.
   */
  readonly component: ComponentChanges_node$key;
};

/**
 * Props accepted by `ComponentChanges`: the component, then the native
 * props of its `<ol>` root, the content of the page's changes section.
 * The native `children` are excluded: the part renders the log.
 */
export type ComponentChangesProps = OwnProps &
  Omit<ComponentProps<"ol">, keyof OwnProps | "children">;
