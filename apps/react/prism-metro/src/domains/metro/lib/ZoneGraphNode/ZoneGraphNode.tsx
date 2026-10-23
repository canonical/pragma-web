// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/ZoneGraphNode_node.graphql.js";
import type { ZoneGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ZoneGraphNode reads from the Zone it renders: its name, its
 * compact address and its class's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ZoneGraphNode_node on Zone {
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

const componentCssClassName = "ds zone-graph-node";

/**
 * A fare zone as a node of a graph, native SVG: its name on the first
 * line, then its class alone muted. A fare zone has no home on this site,
 * so the name reads as inert text.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and
 * the root carries the typename as `data-type`.
 *
 * `import { ZoneGraphNode } from "./lib/index.js";`
 *
 * @implements metro.component.zone_graph_node
 * @note Impure: reads its zone from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function ZoneGraphNode({
  node,
  className,
  ...props
}: ZoneGraphNodeProps): ReactElement {
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
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      title={title}
    />
  );
}
