// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/ModifierGraphNode_node.graphql.js";
import type { ModifierGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierGraphNode reads from the Modifier it renders: its
 * compact address and class.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierGraphNode_node on Modifier {
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

const componentCssClassName = "ds modifier-graph-node";

/**
 * A modifier as a node of a graph, native SVG: its compact address
 * (`ds:global.modifier.danger`) on the first line, in the identifier face,
 * linked to its home when the site has one and inert text when it has none,
 * then its class in its namespace's prefix muted (`Modifier in ds`). A modifier
 * whose address did not compact names its class alone.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and the
 * root carries the typename as `data-type`.
 *
 * `import { ModifierGraphNode } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_graph_node
 * @note Impure: reads its modifier from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function ModifierGraphNode({
  node,
  className,
  ...props
}: ModifierGraphNodeProps): ReactElement {
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
      title={<tspan className="identifier">{curie}</tspan>}
    />
  );
}
