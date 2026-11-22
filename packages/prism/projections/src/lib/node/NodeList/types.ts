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
  /**
   * The address's `sort` value: a value field's id, descending behind a
   * `-`; the nodes keep their order when omitted.
   */
  readonly sort?: string;
  /** The value fields the table of facts leaves out, by id. */
  readonly omits?: readonly string[];
} & Pick<EntityListProps, "renderer" | "empty" | "lines" | "selected">;

/**
 * Props accepted by `NodeList`: its own, the list view's renderer, empty
 * line, row height and selection among them, then the native props of the
 * list's `<div>` root. The native `children` are excluded: the list's items
 * are its nodes.
 */
export type NodeListProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;

/** A listed node's type, with the type's superclasses when read. */
export interface ListedNode {
  readonly _meta: {
    readonly type: {
      readonly uri: string;
      readonly superclasses?: readonly { readonly uri: string }[] | null;
    };
  };
}

/** One value a node shows for a field, as `Node.values` serves it. */
export interface ListedValue {
  readonly field: string;
  readonly label: string;
  readonly text?: string | null;
  /** How the field's values read; a number's text shows grouped. */
  readonly type?: string;
}

/** A node with the values it shows, when read. */
export interface ValuedNode {
  readonly values?: readonly ListedValue[] | null;
}

/** The order a list's `sort` value names. */
export interface ListSort {
  /** The value field the list is sorted by. */
  readonly field: string;
  /** Whether the order runs descending. */
  readonly descending: boolean;
}
