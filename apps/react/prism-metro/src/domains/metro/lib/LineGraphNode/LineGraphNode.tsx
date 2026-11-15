// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  SwatchMark,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/LineGraphNode_node.graphql.js";
import type { LineGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineGraphNode reads from the Line it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineGraphNode_node on Line {
    __typename
    colour
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds line-graph-node";

/**
 * A line as a node of a graph: its mark, its prefix off the page's
 * namespace and its name, linked to its home. Its mark says its type, so
 * it names no kind.
 * Its mark is a disc of the line's colour (`SwatchMark`), which the
 * package paints only with a plain colour value.
 *
 * Native props reach the node's `<g>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { LineGraphNode } from "#domains/metro";`
 *
 * @implements metro.component.line_graph_node
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers.
 */
export default function LineGraphNode({
  node,
  className,
  ...props
}: LineGraphNodeProps): ReactElement {
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
      mark={
        <foreignObject height="100%" width="100%">
          <SwatchMark colour={data.colour} />
        </foreignObject>
      }
      prefix={prefix}
      title={title}
    />
  );
}
