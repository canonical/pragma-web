// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/CodeStandardGraphNode_node.graphql.js";
import type { CodeStandardGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardGraphNode reads from the CodeStandard it
 * renders: its title, compact address and class.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardGraphNode_node on CodeStandard {
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

const componentCssClassName = "ds code-standard-graph-node";

/**
 * A code standard as a node of a graph, native SVG: its title (`Public and
 * private subcomponent exports`) on the first line, linked to its home when
 * the site has one and inert text when it has none, then its class in its
 * namespace's prefix muted (`Code Standard in cs`). A standard whose address
 * did not compact names its class alone.
 *
 * A standard's title is a sentence, which the node's default width of 192
 * units never holds: the graph's layout sizes a standard's node from its
 * title and passes that `width`, or the title is clipped at the node's inner
 * edge.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and the
 * root carries the typename as `data-type`.
 *
 * `import { CodeStandardGraphNode } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_graph_node
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function CodeStandardGraphNode({
  node,
  className,
  ...props
}: CodeStandardGraphNodeProps): ReactElement {
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
      location={findCuriePrefix(curie)}
      title={data._meta.title}
    />
  );
}
