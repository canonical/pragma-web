// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/NodeGraphNode_node.graphql.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityGraphNode } from "../../ui/index.js";
import { findCuriePrefix } from "../../utils/index.js";
import type { NodeGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields NodeGraphNode reads from the Node it renders, which every node
 * carries: its compact address and its class's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment NodeGraphNode_node on Node {
    __typename
    _meta {
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

const componentCssClassName = "ds node-graph-node";

/**
 * Any graph node as a node of a graph, native SVG, from what every node
 * carries: its compact address on the first line, linked to its home when
 * the site has one and inert text when it has none, then "kind in
 * location" muted, its class's title in its namespace's prefix. A node
 * whose address did not compact names its class alone.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and
 * the root carries the typename as `data-type`.
 *
 * `import { NodeGraphNode } from "@canonical/prism-projections";`
 *
 * @implements prism.component.node_graph_node
 * @note Impure: reads its node from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function NodeGraphNode({
  node,
  className,
  ...props
}: NodeGraphNodeProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      title={<tspan className="identifier">{curie}</tspan>}
    />
  );
}
