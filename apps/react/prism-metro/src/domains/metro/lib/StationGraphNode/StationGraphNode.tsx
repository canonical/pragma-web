// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/StationGraphNode_node.graphql.js";
import type { StationGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields StationGraphNode reads from the Station it renders: its name,
 * its compact address, its class's title and its fare zone's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment StationGraphNode_node on Station {
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
    inZone {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds station-graph-node";

/**
 * A station as a node of a graph, native SVG: its name on the first line,
 * linked to the station's page, then "kind in location" muted, its class in
 * its fare zone. A station in no zone names its class alone.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and
 * the root carries the typename as `data-type`.
 *
 * `import { StationGraphNode } from "./lib/index.js";`
 *
 * @implements metro.component.station_graph_node
 * @note Impure: reads its station from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function StationGraphNode({
  node,
  className,
  ...props
}: StationGraphNodeProps): ReactElement {
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
      location={data.inZone?._meta.title}
      title={title}
    />
  );
}
