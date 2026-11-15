// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/RollingStockGraphNode_node.graphql.js";
import { ROLLING_STOCK_MARK_ICON } from "../RollingStockChip/constants.js";
import type { RollingStockGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields RollingStockGraphNode reads from the RollingStock it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment RollingStockGraphNode_node on RollingStock {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds rolling-stock-graph-node";

/**
 * A rolling stock as a node of a graph: its mark, its prefix off the page's
 * namespace and its name, linked to its home. Its mark says its type, so
 * it names no kind.
 * Its mark is the rolling stock's glyph, a published icon.
 *
 * Native props reach the node's `<g>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { RollingStockGraphNode } from "#domains/metro";`
 *
 * @implements metro.component.rolling_stock_graph_node
 * @note Impure: reads its rolling stock from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers.
 */
export default function RollingStockGraphNode({
  node,
  className,
  ...props
}: RollingStockGraphNodeProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={ROLLING_STOCK_MARK_ICON} />}
      prefix={prefix}
      title={title}
    />
  );
}
