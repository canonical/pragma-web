// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/UIBlockGraphNode_node.graphql.js";
import type { UIBlockGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields UIBlockGraphNode reads from the UIBlock it renders: its
 * title, compact address and class, and its tier's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment UIBlockGraphNode_node on UIBlock {
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
    tier {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ui-block-graph-node";

/**
 * A UI block as a node of a graph, native SVG: its title (`IconButton`) on
 * the first line, linked to its home when the site has one and inert text
 * when it has none, then its class in its tier muted (`Component in
 * Global`). The title, not the compact address, names the node, since an
 * address is wider than the node and would be clipped.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and the
 * root carries the typename as `data-type`.
 *
 * `import { UIBlockGraphNode } from "#domains/components/lib";`
 *
 * @implements docs.component.ui_block_graph_node
 * @note Impure: reads its block from the Relay store, its home from the site's
 *   homes and its link from the projection provider.
 */
export default function UIBlockGraphNode({
  node,
  className,
  ...props
}: UIBlockGraphNodeProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      location={data.tier?._meta.title}
      title={data._meta.title}
    />
  );
}
