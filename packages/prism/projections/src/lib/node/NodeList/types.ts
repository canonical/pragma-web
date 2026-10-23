// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { NodeList_node$key } from "../../../__generated__/NodeList_node.graphql.js";
import type { EntityListProps } from "../../ui/index.js";

type OwnProps = {
  /**
   * The Relay fragment keys of the nodes to list, from an operation that
   * spreads `...NodeList_node` on a list of nodes.
   */
  readonly nodes: NodeList_node$key;
} & Pick<EntityListProps, "view" | "onViewChange" | "count" | "kind" | "empty">;

/**
 * Props accepted by `NodeList`: its own, the list view's view, count and
 * empty line among them, then the native props of the list's `<div>` root.
 * The native `children` are excluded: the list's items are its nodes.
 */
export type NodeListProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
