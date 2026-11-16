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
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyGraphNode_node.graphql.js";
import { MODIFIER_FAMILY_MARK_ICON } from "../ModifierFamilyChip/constants.js";
import type { ModifierFamilyGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierFamilyGraphNode reads from the ModifierFamily it
 * renders: its title and compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierFamilyGraphNode_node on ModifierFamily {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds modifier-family-graph-node";

/**
 * A modifier family as a node of a graph drawing: the family's mark, its
 * prefix when the family is off the page's namespace, and its title,
 * linked to its home when the site has one and inert text when it has
 * none. Its mark names its type, so it carries no kind.
 *
 * Native props reach the node's `<g>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { ModifierFamilyGraphNode } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_graph_node
 * @note Impure: reads its family from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers.
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
  const prefix = useForeignPrefix(curie);
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={MODIFIER_FAMILY_MARK_ICON} />}
      prefix={prefix}
      title={data._meta.title}
    />
  );
}
