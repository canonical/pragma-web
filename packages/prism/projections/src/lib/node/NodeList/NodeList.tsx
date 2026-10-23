// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/NodeList_node.graphql.js";
import { DEFAULT_ENTITY_LIST_VIEW } from "../../ui/EntityList/constants.js";
import { EntityList } from "../../ui/index.js";
import { CardProjection } from "../CardProjection/index.js";
import { RowProjection } from "../RowProjection/index.js";
import type { NodeListProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields NodeList reads from each Node it lists: its address, which
 * keys its item, and the card's and the row's composites, which dispatch
 * it to its type's arm in either view.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment NodeList_node on Node @relay(plural: true) {
    uri
    ...CardProjection_node
    ...RowProjection_node
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds node-list";

/**
 * An index of graph nodes as the shared list view: `EntityList` with each
 * node as an item, a card through `CardProjection` in the cards view and a
 * row through `RowProjection` in the rows view, so each node reads through
 * the arm its site maps to its type.
 *
 * It keeps no view of its own: the lens holds the view, in the page's
 * address, passes it as `view` and takes the reader's pick from
 * `onViewChange`. The count line, its noun and the empty line are the
 * lens's too.
 *
 * Native props reach the list's `<div>` root; a consumer `className` merges
 * after the projection's own.
 *
 * `import { NodeList } from "@canonical/prism-projections";`
 *
 * @implements prism.component.node_list
 * @note Impure: reads its nodes from the Relay store, and through the
 *   dispatchers each node's arm from the projection provider.
 */
export default function NodeList({
  nodes,
  view = DEFAULT_ENTITY_LIST_VIEW,
  className,
  ...props
}: NodeListProps): ReactElement {
  const data = useFragment(nodeFragment, nodes);
  return (
    <EntityList
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      view={view}
    >
      {data.map((node) =>
        view === "rows" ? (
          <RowProjection key={node.uri} node={node} />
        ) : (
          <CardProjection key={node.uri} node={node} />
        ),
      )}
    </EntityList>
  );
}
