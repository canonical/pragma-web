// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/NodeCard_node.graphql.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityCard } from "../../ui/index.js";
import { findCuriePrefix } from "../../utils/index.js";
import type { NodeCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields NodeCard reads from the Node it renders, which every node
 * carries: its title, its compact address, its definition and its class's
 * title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment NodeCard_node on Node {
    __typename
    _meta {
      title
      curie
      definition
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

const componentCssClassName = "ds node-card";

/**
 * Any graph node as a card in a grid of entities, from what every node
 * carries: its namespace prefix above its title, the title linked to its
 * home when the site has one and inert text when it has none, then its
 * class's title and its definition. A node whose address did not compact
 * has no prefix; any node has no key values, vitals or sidecar.
 *
 * It is the card's `Node` arm: `CardProjection` renders it for every type
 * no other arm takes.
 *
 * Native props reach the card's `<div>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { NodeCard } from "@canonical/prism-projections";`
 *
 * @implements prism.component.node_card
 * @note Impure: reads its node from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function NodeCard({
  node,
  className,
  ...props
}: NodeCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, definition, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
