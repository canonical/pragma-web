// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyGraphNode_node.graphql.js";
import type { ModifierFamilyGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierFamilyGraphNode reads from the ModifierFamily it
 * renders: its compact address and class.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierFamilyGraphNode_node on ModifierFamily {
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

const componentCssClassName = "ds modifier-family-graph-node";

/**
 * A modifier family as a node of a graph, native SVG: its compact address
 * (`ds:global.modifier_family.anticipation`) on the first line, in the
 * identifier face, linked to its home when the site has one and inert text when
 * it has none, then its class in its namespace's prefix muted (`Modifier family
 * in ds`). A family whose address did not compact names its class alone.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and the
 * root carries the typename as `data-type`.
 *
 * `import { ModifierFamilyGraphNode } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_graph_node
 * @note Impure: reads its family from the Relay store, its home from the site's
 *   homes and its link from the projection provider.
 */
export default function ModifierFamilyGraphNode({
  node,
  className,
  ...props
}: ModifierFamilyGraphNodeProps): ReactElement {
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
