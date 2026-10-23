import { CardProjection, RowProjection } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay";
import type { EntityIndex_query$key } from "../../../../__generated__/EntityIndex_query.graphql.js";
import entityIndexFragmentNode from "../../../../__generated__/EntityIndex_query.graphql.js";
import type { EntityIndexPaginationQuery } from "../../../../__generated__/EntityIndexPaginationQuery.graphql.js";
import type { EntityIndexQuery } from "../../../../__generated__/EntityIndexQuery.graphql.js";
import entityIndexQueryNode from "../../../../__generated__/EntityIndexQuery.graphql.js";
import buildEntityIndexVariables from "../../../buildEntityIndexVariables.js";
import { ENTITY_PAGE_SIZE } from "../../../constants.js";
import { useEntityFilter } from "../../../EntityFilterProvider/index.js";
import { useMessages } from "../../../i18n/index.js";
import matchesEntityText from "../../../matchesEntityText.js";
import type { EntityIndexProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `EntityIndex_query`. The index reaches its
 * collection through the TBox: the contract has no root field that names a
 * subject, so the class's instances come from `ontologyClass(uri:)`, the
 * class supplied by the site's binding. The `@connection` key and
 * `@refetchable` generate `EntityIndexPaginationQuery` for "Load more".
 *
 * `title` and `curie` ride beside the row and card spreads because the
 * search filters on them, and fragment data is masked from this component.
 * `instanceCount` is the denominator the strip's status states.
 */
const declareEntityIndexFragment = (): unknown => graphql`
  fragment EntityIndex_query on Query
  @argumentDefinitions(
    classUri: { type: "String!" }
    count: { type: "Int!" }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "EntityIndexPaginationQuery") {
    ontologyClass(uri: $classUri) {
      uri
      instanceCount
      instances(first: $count, after: $cursor)
        @connection(key: "EntityIndex_instances") {
        edges {
          node {
            uri
            _meta {
              title
              curie
            }
            ...RowProjection_node
            ...CardProjection_node
          }
        }
      }
    }
  }
`;
void declareEntityIndexFragment;
/* v8 ignore stop */

const componentCssClassName = "ds entity-index";

/**
 * The bound class's loaded instances, as a list of rows or a grid of cards,
 * narrowed by the strip's search. It reads the index's one operation from
 * the warm store, with the same variables builder the route's warm uses, and
 * pages through the class with an explicit "Load more" while the graph has
 * more: cursors are the graph's own, never derived here.
 *
 * Each entry renders through the site's projections (`RowProjection`,
 * `CardProjection`), so a site that maps an arm for the class's type renders its
 * entries its own way, and links each to its home.
 *
 * A class the graph does not know (`ontologyClass` is null) and a class with
 * no instances both render the empty state; a search that hides every
 * loaded entry says so instead.
 *
 * `import { EntityIndex } from "./common/EntityIndex/index.js";`
 */
export default function EntityIndex({
  binding,
  className,
  ...props
}: EntityIndexProps): ReactElement {
  const t = useMessages();
  const { filter } = useEntityFilter();
  const query = useLazyLoadQuery<EntityIndexQuery>(
    entityIndexQueryNode,
    buildEntityIndexVariables(binding),
  );
  const { data, hasNext, isLoadingNext, loadNext } = usePaginationFragment<
    EntityIndexPaginationQuery,
    EntityIndex_query$key
  >(entityIndexFragmentNode, query);
  const edges = data.ontologyClass?.instances.edges ?? [];
  const visible = edges.filter(({ node }) =>
    matchesEntityText(filter.text, node._meta),
  );

  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-view={filter.view}
    >
      {edges.length === 0 ? (
        <p className="empty">{t("index.empty")}</p>
      ) : visible.length === 0 ? (
        <p className="empty">{t("index.noMatch")}</p>
      ) : filter.view === "rows" ? (
        <ul className="rows">
          {visible.map(({ node }) => (
            <RowProjection key={node.uri} node={node} />
          ))}
        </ul>
      ) : (
        <div className="cards">
          {visible.map(({ node }) => (
            <CardProjection key={node.uri} node={node} />
          ))}
        </div>
      )}
      {hasNext ? (
        <p className="more">
          <button
            disabled={isLoadingNext}
            onClick={() => {
              loadNext(ENTITY_PAGE_SIZE);
            }}
            type="button"
          >
            {isLoadingNext ? t("index.loadingMore") : t("index.more")}
          </button>
        </p>
      ) : null}
    </div>
  );
}
