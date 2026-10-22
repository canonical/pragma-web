import type { ComponentProps } from "react";
import type { StandardsIndex_query$key } from "../../__generated__/StandardsIndex_query.graphql.js";

type OwnProps = {
  /** Fragment ref over the Query root (the index page's one query). */
  readonly query: StandardsIndex_query$key;
};

/** Props accepted by `StandardsIndex`: the query root, and the native props
 * of its root `<div>`. */
export type StandardsIndexProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;

/** The part of an index node `groupByClass` reads: its class. */
export interface GroupableNode {
  readonly _meta: {
    readonly type: {
      /** The class's absolute IRI, the group's identity. */
      readonly uri: string;
      readonly _meta: {
        /** The class's title, the group's heading. */
        readonly title: string;
      };
    };
  };
}

/** One group of the index: the nodes of one class. */
export interface StandardsGroup<TNode> {
  /** The class's absolute IRI. */
  readonly classUri: string;
  /** The class's title. */
  readonly title: string;
  /** The class's nodes, in connection order. */
  readonly nodes: readonly TNode[];
}
