import { Link } from "@canonical/router-react";
import type { ReactElement } from "react";
import { graphql, usePaginationFragment } from "react-relay";
import type { StandardsIndex_query$key } from "../../__generated__/StandardsIndex_query.graphql.js";
import standardsIndexFragmentNode from "../../__generated__/StandardsIndex_query.graphql.js";
import type { StandardsIndexPaginationQuery } from "../../__generated__/StandardsIndexPaginationQuery.graphql.js";
import { STANDARDS_PAGE_SIZE } from "../constants.js";
import { useMessages } from "../i18n/index.js";
import buildGroupAnchorId from "./buildGroupAnchorId.js";
import groupByClass from "./groupByClass.js";
import type { StandardsIndexProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `StandardsIndex_query`. The `@connection` key
 * and `@refetchable` generate `StandardsIndexPaginationQuery` for
 * `loadNext`.
 *
 * THE LENS REACHES ITS COLLECTION THROUGH THE TBOX. The contract has no root
 * field that names a subject, so the index enumerates
 * `ontologyClass(uri: $classUri).instances`, the class supplied by the
 * site's binding. Relay accepts a `@refetchable` fragment on `Query` whose
 * `@connection` sits nested inside `ontologyClass`; the generated pagination
 * query carries `$classUri` through with the rest.
 *
 * `ontologyClass` is NULLABLE and the component treats it as such: a binding
 * that names a class this graph does not carry renders the empty state, not
 * a crash.
 */
const declareStandardsIndexFragment = (): unknown => graphql`
  fragment StandardsIndex_query on Query
  @argumentDefinitions(
    classUri: { type: "String!" }
    count: { type: "Int!" }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "StandardsIndexPaginationQuery") {
    ontologyClass(uri: $classUri) {
      uri
      instances(first: $count, after: $cursor)
        @connection(key: "StandardsIndex_instances") {
        edges {
          node {
            uri
            _meta {
              curie
              title
              type {
                uri
                _meta {
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`;
void declareStandardsIndexFragment;
/* v8 ignore stop */

const componentCssClassName = "ds standards-index";

/**
 * The index's composed layout: group jump links over the grouped reading
 * lists, each across the whole main column. Pagination is Relay's connection machinery, surfaced as an explicit
 * "Load more" button rather than an invisible truncation; cursors are opaque
 * server state, never derived here.
 *
 * Grouping is by each instance's own class (`groupByClass`). A bound class
 * with no subclasses gives exactly one group, so the jump-link nav renders
 * only when there is more than one: a one-item nav is noise.
 *
 * Each link's text is `_meta.title`, which is total: the provider computes a
 * fallback chain ending in the IRI's local name, then the whole IRI, so
 * there is no fallback here. Its address is `uri`, the absolute IRI, because
 * `node(id:)` accepts nothing else.
 *
 * `import { StandardsIndex } from "./StandardsIndex/index.js";`
 */
export default function StandardsIndex({
  className,
  query,
  ...props
}: StandardsIndexProps): ReactElement {
  const t = useMessages();
  const { data, hasNext, isLoadingNext, loadNext } = usePaginationFragment<
    StandardsIndexPaginationQuery,
    StandardsIndex_query$key
  >(standardsIndexFragmentNode, query);
  const edges = data.ontologyClass?.instances.edges ?? [];
  const groups = groupByClass(edges.map(({ node }) => node));

  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {groups.length > 1 ? (
        <nav
          aria-label={t("index.categories.label")}
          className="categories"
          data-region="secondary-nav"
        >
          <ul className="category-links">
            {groups.map((group) => (
              <li key={group.classUri}>
                <a
                  className="category-link"
                  href={`#${buildGroupAnchorId(group.classUri)}`}
                >
                  {group.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <div className="groups" data-region="canvas">
        {/* Two ways to get here: a zero-edge connection, and a binding that
            names a class this graph does not carry. Both render the empty
            state rather than a blank canvas. */}
        {groups.length === 0 ? (
          <p className="empty">{t("index.empty")}</p>
        ) : null}
        {groups.map((group) => {
          const anchorId = buildGroupAnchorId(group.classUri);
          return (
            <section
              aria-labelledby={`${anchorId}-title`}
              className="group"
              id={anchorId}
              key={group.classUri}
            >
              <h2 className="group-heading" id={`${anchorId}-title`}>
                {group.title}
              </h2>
              <ul className="list">
                {group.nodes.map((node) => (
                  <li key={node.uri}>
                    <Link params={{ uri: node.uri }} to="standardEntity">
                      {node._meta.title}
                    </Link>{" "}
                    <code>{node._meta.curie}</code>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {hasNext ? (
          <p className="more">
            <button
              disabled={isLoadingNext}
              onClick={() => {
                loadNext(STANDARDS_PAGE_SIZE);
              }}
              type="button"
            >
              {isLoadingNext ? t("index.more.loading") : t("index.more")}
            </button>
          </p>
        ) : null}
      </div>
    </div>
  );
}
