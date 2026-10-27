// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/RollingStockGraphNode_node.graphql.js";
import type { RollingStockGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields RollingStockGraphNode reads from the RollingStock it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment RollingStockGraphNode_node on RollingStock {
    __typename
    _meta {
      title
      curie
      type {
        _meta {
          title
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds rolling-stock-graph-node";

/**
 * A rolling stock as a node of a graph: its name, linked to the stock's
 * page, and its class.
 *
 * Native props reach the root the EntityGraphNode renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { RollingStockGraphNode } from "./RollingStockGraphNode/index.js";`
 *
 * @implements metro.component.rolling_stock_graph_node
 * @note Impure: reads its rolling stock from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function RollingStockGraphNode({
  node,
  className,
  ...props
}: RollingStockGraphNodeProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      kind={type._meta.title}
      title={title}
    />
  );
}
