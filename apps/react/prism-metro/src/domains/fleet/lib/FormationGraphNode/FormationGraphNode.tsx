// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityGraphNode,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/FormationGraphNode_node.graphql.js";
import type { FormationGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields FormationGraphNode reads from the Formation it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment FormationGraphNode_node on Formation {
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
    stock {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds formation-graph-node";

/**
 * A formation as a node of a graph: its name, linked to the formation's
 * page, its class and its stock.
 *
 * Native props reach the root the EntityGraphNode renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { FormationGraphNode } from "./FormationGraphNode/index.js";`
 *
 * @implements metro.component.formation_graph_node
 * @note Impure: reads its formation from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function FormationGraphNode({
  node,
  className,
  ...props
}: FormationGraphNodeProps): ReactElement {
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
      location={data.stock._meta.title}
      title={title}
    />
  );
}
