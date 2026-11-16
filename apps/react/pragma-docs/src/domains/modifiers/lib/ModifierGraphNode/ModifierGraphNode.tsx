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
import nodeFragment from "../../../../relay/__generated__/ModifierGraphNode_node.graphql.js";
import { MODIFIER_MARK_ICON } from "../ModifierChip/constants.js";
import type { ModifierGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierGraphNode reads from the Modifier it renders:
 * its title and compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierGraphNode_node on Modifier {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds modifier-graph-node";

/**
 * A modifier as a node of a graph drawing: the modifier's mark, its
 * prefix when the modifier is off the page's namespace, and its title,
 * linked to its home when the site has one and inert text when it has
 * none. Its mark names its type, so it carries no kind.
 *
 * Native props reach the node's `<g>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { ModifierGraphNode } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_graph_node
 * @note Impure: reads its modifier from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers.
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
  const prefix = useForeignPrefix(curie);
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={MODIFIER_MARK_ICON} />}
      prefix={prefix}
      title={data._meta.title}
    />
  );
}
