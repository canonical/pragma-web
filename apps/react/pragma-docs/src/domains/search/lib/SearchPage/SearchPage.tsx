// Scaffolded by @canonical/summon-component:react v0.46.0

import {
  collectLenses,
  FilterBar,
  PaginationBar,
  TypeFacetBar,
} from "@canonical/prism-core";
import { SearchPassage, SearchResultGroup } from "@canonical/prism-projections";
import { Head } from "@canonical/react-head";
import type { RouteMap } from "@canonical/router-core";
import { Link, useRouter } from "@canonical/router-react";
import type { ReactElement } from "react";
import { useLazyLoadQuery } from "react-relay";
import { useMessages } from "#i18n";
import { DocsChipProjection } from "#lib/ui";
import buildSearchVariables from "../../buildSearchVariables.js";
import {
  SEARCH_DOOR_CLASSES,
  SEARCH_PAGE_SIZE,
  SEARCH_PROMINENT_CLASS,
  SEARCH_TITLE_ID,
} from "../../constants.js";
import groupSearchEdges, { orderSearchFacets } from "../../groupSearchEdges.js";
import {
  type DocsSearchDoorsQuery,
  searchDoorsQueryNode,
} from "../../searchDoorsQuery.js";
import { type DocsSearchQuery, searchQueryNode } from "../../searchQuery.js";
import type { SearchValues } from "../../types.js";
import type {
  SearchFacetsProps,
  SearchPageProps,
  SearchStateProps,
} from "./types.js";
import "./styles.css";

const componentCssClassName = "ds search-page";

/** The route a lens's Definitions live at, when the site has them. */
const DEFINITIONS_ROUTE = "definitions";

/**
 * The strip's count for the address's text: how many results match.
 *
 * `import { SearchCount } from "./lib/index.js";`
 *
 * @note Impure: reads `DocsSearchQuery` from the Relay store, fetching it
 *   when the store lacks it.
 */
export function SearchCount({
  text,
  type,
  after,
  page = 1,
}: SearchStateProps): ReactElement {
  const t = useMessages();
  const { search } = useLazyLoadQuery<DocsSearchQuery>(
    searchQueryNode,
    buildSearchVariables(text, { type, after, page }),
  );
  return <>{t("search.results", { count: search.total })}</>;
}

/**
 * The Type facet for the address's text while two or more types match:
 * in the facet bar under the strip (`placement` "bar"), or alone for the
 * filter sheet ("sheet"). Each type links to the address with it applied,
 * the applied one to the address that releases it.
 *
 * `import { SearchFacets } from "./lib/index.js";`
 *
 * @note Impure: reads `DocsSearchQuery` from the Relay store, fetching it
 *   when the store lacks it.
 */
export function SearchFacets({
  text,
  type,
  after,
  page = 1,
  placement,
}: SearchFacetsProps): ReactElement | null {
  const router = useRouter();
  const { search } = useLazyLoadQuery<DocsSearchQuery>(
    searchQueryNode,
    buildSearchVariables(text, { type, after, page }),
  );
  if (search.facets.length < 2) return null;
  const facet = (
    <TypeFacetBar
      facets={orderSearchFacets(search.facets, SEARCH_PROMINENT_CLASS).map(
        ({ count, type: facetType }) => ({
          id: facetType.uri,
          label: facetType.label ?? facetType._meta.title,
          count,
          href: router.buildPath("search", {
            search:
              facetType.uri === type
                ? { q: text }
                : { q: text, type: facetType.uri },
          }),
          selected: facetType.uri === type,
        }),
      )}
      withChip={placement !== "bar"}
    />
  );
  return placement === "bar" ? <FilterBar facets={facet} /> : facet;
}

/**
 * The page's results for a text: the results grouped by type and, when
 * they run past one page, the pagination bar; or, when nothing matches, the no-match state. The
 * strip holds their count and the facet bar under it the Type facet.
 *
 * @note Impure: reads `DocsSearchQuery` from the Relay store, fetching it
 *   when the store lacks it.
 */
function SearchResults({
  text,
  type,
  after,
  page = 1,
}: Omit<SearchPageProps, "className">): ReactElement {
  const t = useMessages();
  const router = useRouter();
  const { search, earlier, previous } = useLazyLoadQuery<DocsSearchQuery>(
    searchQueryNode,
    buildSearchVariables(text, { type, after, page }),
  );
  const href = (values: SearchValues): string =>
    router.buildPath("search", { search: { ...values } });
  if (search.total === 0) {
    return (
      <div className="none" role="status">
        <p>{t("search.none", { text: text.trim() })}</p>
        <ul className="hints">
          <li>{t("search.spelling")}</li>
          {DEFINITIONS_ROUTE in router.routes && (
            <li>
              <Link<RouteMap, string> to={DEFINITIONS_ROUTE}>
                {t("search.definitions")}
              </Link>
            </li>
          )}
          <li>{t("search.palette")}</li>
        </ul>
      </div>
    );
  }
  const first = (page - 1) * SEARCH_PAGE_SIZE + 1;
  const previousValues: SearchValues | undefined =
    page === 1
      ? undefined
      : page === 2
        ? { q: text, type }
        : {
            q: text,
            type,
            after: previous?.pageInfo.endCursor ?? undefined,
            page: String(page - 1),
          };
  return (
    <>
      <div className="results">
        {groupSearchEdges(search.edges, search.facets, {
          prominent: SEARCH_PROMINENT_CLASS,
          earlier: new Set(
            earlier?.edges.map(({ node }) => node._meta.type.uri),
          ),
        }).map((group) => (
          <SearchResultGroup
            continued={group.continued}
            count={group.count}
            key={group.type}
            title={group.title}
          >
            {group.edges.map(({ cursor, node, match }) => (
              <li className="result" key={cursor}>
                <DocsChipProjection node={node} />
                <SearchPassage
                  className="passage"
                  passage={match.passage}
                  ranges={match.ranges}
                />
              </li>
            ))}
          </SearchResultGroup>
        ))}
      </div>
      {(previousValues !== undefined || search.pageInfo.hasNextPage) && (
        <PaginationBar
          label={t("search.position", {
            first: String(first),
            last: String(first + search.edges.length - 1),
            total: String(search.total),
          })}
          nextHref={
            search.pageInfo.hasNextPage && search.pageInfo.endCursor
              ? href({
                  q: text,
                  type,
                  after: search.pageInfo.endCursor,
                  page: String(page + 1),
                })
              : undefined
          }
          previousHref={
            previousValues === undefined ? undefined : href(previousValues)
          }
        />
      )}
    </>
  );
}

/**
 * The empty state: what the field is for, and the site's lenses as doors,
 * each with the total of the class it lists; a lens that lists no single
 * class shows no total.
 *
 * @note Impure: reads `DocsSearchDoorsQuery` from the Relay store,
 *   fetching it when the store lacks it.
 */
function SearchDoors(): ReactElement {
  const t = useMessages();
  const router = useRouter();
  const totals: Readonly<
    Record<string, { readonly totalCount: number } | undefined>
  > = useLazyLoadQuery<DocsSearchDoorsQuery>(searchDoorsQueryNode, {
    ...SEARCH_DOOR_CLASSES,
  });
  return (
    <>
      <p className="summary">{t("search.empty")}</p>
      <ul aria-label={t("search.doors")} className="doors">
        {collectLenses(router.routes).map(({ name, label, icon: Icon }) => (
          <li key={name}>
            <Link<RouteMap, string> className="door" to={name}>
              <span aria-hidden="true" className="icon">
                <Icon />
              </span>
              <span className="name">{label}</span>
              {totals[name] !== undefined && (
                <span className="total">{totals[name].totalCount}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * The search route's page: its title (the document's title too), then
 * the results for the address's text, grouped by type and paged by
 * `SEARCH_PAGE_SIZE`; the no-match state when nothing matches; and the
 * lenses as doors, with their totals, when the address carries no text.
 *
 * `import { SearchPage } from "./lib/index.js";`
 *
 * @implements docs.component.search_page
 * @note Impure: reads `DocsSearchQuery` from the Relay store when the
 *   address carries a text, `DocsSearchDoorsQuery` when it carries none,
 *   fetching either when the store lacks it.
 */
export default function SearchPage({
  text,
  type,
  after,
  page,
  className,
  ...props
}: SearchPageProps): ReactElement {
  const t = useMessages();
  return (
    <section
      {...props}
      aria-labelledby={SEARCH_TITLE_ID}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <Head title={t("search.title")} />
      <h1 className="title" id={SEARCH_TITLE_ID}>
        {t("search.title")}
      </h1>
      {text.trim() === "" ? (
        <SearchDoors />
      ) : (
        <SearchResults after={after} page={page} text={text} type={type} />
      )}
    </section>
  );
}
