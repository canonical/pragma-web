// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/UnitGraphNode_node.graphql.js";
import type { UnitGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields UnitGraphNode reads from the Unit it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment UnitGraphNode_node on Unit {
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

const componentCssClassName = "ds unit-graph-node";

/**
 * A unit as a node of a graph: its name, linked to the unit's page, and
 * its class.
 *
 * Native props reach the root the EntityGraphNode renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { UnitGraphNode } from "./UnitGraphNode/index.js";`
 *
 * @implements metro.component.unit_graph_node
 * @note Impure: reads its unit from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function UnitGraphNode({
  node,
  className,
  ...props
}: UnitGraphNodeProps): ReactElement {
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
      LinkComponent={LinkComponent}
      kind={type._meta.title}
      title={title}
    />
  );
}
