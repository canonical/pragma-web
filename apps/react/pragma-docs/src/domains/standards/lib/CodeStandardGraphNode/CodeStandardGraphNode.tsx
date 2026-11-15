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
import nodeFragment from "../../../../relay/__generated__/CodeStandardGraphNode_node.graphql.js";
import { CODE_STANDARD_MARK_ICON } from "../CodeStandardChip/constants.js";
import type { CodeStandardGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardGraphNode reads from the CodeStandard it renders:
 * its title and compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardGraphNode_node on CodeStandard {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds code-standard-graph-node";

/**
 * A code standard as a node of a graph drawing: the standard's mark, its
 * prefix when the standard is off the page's namespace, and its title,
 * linked to its home when the site has one and inert text when it has
 * none. Its mark names its type, so it carries no kind.
 *
 * Native props reach the node's `<g>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { CodeStandardGraphNode } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_graph_node
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers.
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
  const prefix = useForeignPrefix(curie);
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CODE_STANDARD_MARK_ICON} />}
      prefix={prefix}
      title={data._meta.title}
    />
  );
}
