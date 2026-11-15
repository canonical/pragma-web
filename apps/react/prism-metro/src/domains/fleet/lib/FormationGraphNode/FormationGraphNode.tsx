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
import nodeFragment from "#relay/__generated__/FormationGraphNode_node.graphql.js";
import { FORMATION_MARK_ICON } from "../FormationChip/constants.js";
import type { FormationGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields FormationGraphNode reads from the Formation it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment FormationGraphNode_node on Formation {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds formation-graph-node";

/**
 * A formation as a node of a graph: its mark, its prefix off the page's
 * namespace and its name, linked to its home. Its mark says its type, so
 * it names no kind.
 * Its mark is the formation's glyph, a published icon.
 *
 * Native props reach the node's `<g>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { FormationGraphNode } from "#domains/metro";`
 *
 * @implements metro.component.formation_graph_node
 * @note Impure: reads its formation from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers.
 */
export default function FormationGraphNode({
  node,
  className,
  ...props
}: FormationGraphNodeProps): ReactElement {
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
      mark={<Icon icon={FORMATION_MARK_ICON} />}
      prefix={prefix}
      title={title}
    />
  );
}
