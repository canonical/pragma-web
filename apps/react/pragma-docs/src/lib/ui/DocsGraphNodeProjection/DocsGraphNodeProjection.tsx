// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  NodeGraphNode,
  OntologyClassGraphNode,
  requireArmKey,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { UIBlockGraphNode } from "#domains/components/lib";
import {
  ModifierFamilyGraphNode,
  ModifierGraphNode,
} from "#domains/modifiers/lib";
import { CodeStandardGraphNode } from "#domains/standards/lib";
import nodeFragment from "../../../relay/__generated__/DocsGraphNodeProjection_node.graphql.js";
import type { DocsGraphNodeProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields DocsGraphNodeProjection reads from the Node it dispatches: its
 * typename; the package's `Node` arm, spread aliased as `Node`, for
 * every type no other arm takes; the package's ontology class arm; and the arm of each
 * design-system type, aliased by the type it is on. The three UI-block
 * types share one arm, each narrowed by an inline fragment, so each alias
 * holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment DocsGraphNodeProjection_node on Node {
    __typename
    ...NodeGraphNode_node @alias(as: "Node")
    ...OntologyClassGraphNode_node @alias(as: "OntologyClass")
    ... on Component @alias(as: "Component") {
      ...UIBlockGraphNode_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockGraphNode_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockGraphNode_node
    }
    ...ModifierGraphNode_node @alias(as: "Modifier")
    ...ModifierFamilyGraphNode_node @alias(as: "ModifierFamily")
    ...CodeStandardGraphNode_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the node of a graph drawing on this site, dispatched on its type by an
 * explicit switch, the cases being `DOCS_GRAPH_NODE_TYPES`: a component, a pattern
 * or a layout renders through `UIBlockGraphNode`, a modifier through
 * `ModifierGraphNode`, a modifier family through `ModifierFamilyGraphNode` and a
 * code standard through `CodeStandardGraphNode`; an ontology class through the
 * package's class arm, `OntologyClassGraphNode`; every other node through the
 * package's `Node` arm, `NodeGraphNode`. It spreads the package's arms, not its
 * switch: the package's switch reaches this one through the site slot, so
 * spreading it here would make a fragment cycle.
 *
 * It renders no element of its own: the arm renders the root, a `<g>`,
 * and every native prop reaches it.
 *
 * `import { DocsGraphNodeProjection } from "#lib/ui";`
 *
 * @implements docs.component.docs_graph_node_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function DocsGraphNodeProjection({
  node,
  ...props
}: DocsGraphNodeProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (data.__typename) {
    case "Component":
      return (
        <UIBlockGraphNode
          {...props}
          node={requireArmKey(data.Component, data.__typename)}
        />
      );
    case "Pattern":
      return (
        <UIBlockGraphNode
          {...props}
          node={requireArmKey(data.Pattern, data.__typename)}
        />
      );
    case "Layout":
      return (
        <UIBlockGraphNode
          {...props}
          node={requireArmKey(data.Layout, data.__typename)}
        />
      );
    case "Modifier":
      return (
        <ModifierGraphNode
          {...props}
          node={requireArmKey(data.Modifier, data.__typename)}
        />
      );
    case "ModifierFamily":
      return (
        <ModifierFamilyGraphNode
          {...props}
          node={requireArmKey(data.ModifierFamily, data.__typename)}
        />
      );
    case "CodeStandard":
      return (
        <CodeStandardGraphNode
          {...props}
          node={requireArmKey(data.CodeStandard, data.__typename)}
        />
      );
    case "OntologyClass":
      return (
        <OntologyClassGraphNode
          {...props}
          node={requireArmKey(data.OntologyClass, data.__typename)}
        />
      );
    default:
      return <NodeGraphNode {...props} node={data.Node} />;
  }
}
