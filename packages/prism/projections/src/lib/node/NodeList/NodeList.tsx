// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  buildViewHref,
  HIDDEN_VISIBILITY,
  useViewLocation,
  VIEW_PARAMS,
} from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/NodeList_node.graphql.js";
import { DEFAULT_ENTITY_LIST_RENDERER } from "../../ui/EntityList/constants.js";
import { EntityList } from "../../ui/index.js";
import { CardProjection } from "../CardProjection/index.js";
import { RowProjection } from "../RowProjection/index.js";
import { NodeTitle } from "./common/index.js";
import findListedType from "./findListedType.js";
import orderByValue from "./orderByValue.js";
import readListSort from "./readListSort.js";
import type { NodeListProps } from "./types.js";
import writeNextSort from "./writeNextSort.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields NodeList reads from each Node it lists: its address, which
 * keys its item, its title and type, which link its table row and tell a
 * single-type list from a mixed one, its type's visibility, which drops
 * values from the list, the values its lens displays, which fill the
 * table's cells, and the card's and the row's composites, which dispatch
 * it to its type's arm in either view.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment NodeList_node on Node @relay(plural: true) {
    __typename
    uri
    _meta {
      title
      curie
      type {
        uri
        visibility
        superclasses {
          uri
        }
      }
    }
    values {
      field
      label
      text
    }
    ...CardProjection_node
    ...RowProjection_node
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds node-list";

/**
 * An index of graph nodes as the shared list view: `EntityList` with each
 * node as an item, a row through `RowProjection` in the `table` renderer
 * and a card through `CardProjection` in the `cards` renderer, so each node
 * reads through the arm of its type.
 *
 * A node whose type the graph's type lens hides is a value, never an
 * entity, so the list skips it; the empty line shows when every node is
 * hidden.
 *
 * In the `table` renderer, a list whose nodes share one type up to their
 * superclasses is a table of facts: its columns are the first node's
 * values but those `omits` names, each header a link that sorts the list
 * by it, and each row the node's title and its values in the columns'
 * order. A mixed list, or one whose nodes carry no values, keeps the rows.
 * The `sort` orders the nodes by a value's text in every renderer, and
 * the `selected` node, by address or curie, is highlighted in every
 * renderer: the table's row is marked selected, a row or a card current.
 *
 * It keeps no renderer of its own: the lens reads it from the page's
 * address and passes its name as `renderer`. The empty line is the lens's
 * too.
 *
 * Native props reach the list's `<div>` root; a consumer `className` merges
 * after the projection's own.
 *
 * `import { NodeList } from "@canonical/prism-projections";`
 *
 * @implements prism.component.node_list
 * @note Impure: reads its nodes from the Relay store, the address, and
 *   through the dispatchers each node's arm from the projection provider.
 */
export default function NodeList({
  nodes,
  renderer = DEFAULT_ENTITY_LIST_RENDERER,
  sort,
  omits = [],
  lines,
  selected,
  className,
  ...props
}: NodeListProps): ReactElement {
  const { pathname, search } = useViewLocation();
  const order = readListSort(sort);
  const data = orderByValue(
    useFragment(nodeFragment, nodes).filter(
      ({ _meta }) => _meta.type.visibility !== HIDDEN_VISIBILITY,
    ),
    order,
  );
  const listClassName = [componentCssClassName, className]
    .filter(Boolean)
    .join(" ");
  const selectedUri = data.find(
    ({ uri, _meta }) => uri === selected || _meta.curie === selected,
  )?.uri;
  const fields = (data.at(0)?.values ?? []).filter(
    ({ field }) => !omits.includes(field),
  );
  if (
    renderer === "table" &&
    fields.length > 0 &&
    findListedType(data) !== null
  ) {
    const columns = fields.map(({ field, label }) => ({
      field,
      header: label,
      href: buildViewHref(pathname, {
        ...search,
        [VIEW_PARAMS.sort]: writeNextSort(field, order),
      }),
      sorted:
        order?.field === field
          ? order.descending
            ? ("descending" as const)
            : ("ascending" as const)
          : undefined,
    }));
    const rows = data.map((node) => ({
      key: node.uri,
      title: (
        <NodeTitle
          curie={node._meta.curie}
          title={node._meta.title}
          typename={node.__typename}
        />
      ),
      cells: columns.map(({ field }) => ({
        field,
        text:
          (node.values ?? []).find((value) => value.field === field)?.text ??
          null,
      })),
    }));
    return (
      <EntityList
        {...props}
        className={listClassName}
        columns={columns}
        lines={lines}
        renderer={renderer}
        rows={rows}
        selected={selectedUri}
      />
    );
  }
  return (
    <EntityList {...props} className={listClassName} renderer={renderer}>
      {data.map((node) =>
        renderer === "cards" ? (
          <CardProjection
            aria-current={node.uri === selectedUri ? "true" : undefined}
            key={node.uri}
            node={node}
          />
        ) : (
          <RowProjection
            aria-current={node.uri === selectedUri ? "true" : undefined}
            key={node.uri}
            lines={lines}
            node={node}
          />
        ),
      )}
    </EntityList>
  );
}
