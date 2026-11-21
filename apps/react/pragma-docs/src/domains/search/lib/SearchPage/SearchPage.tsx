// Scaffolded by @canonical/summon-component:react v0.46.0

import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { useLazyLoadQuery } from "react-relay";
import { useMessages } from "#i18n";
import { DocsChipProjection } from "#lib/ui";
import buildSearchVariables from "../../buildSearchVariables.js";
import { SEARCH_TITLE_ID } from "../../constants.js";
import { type DocsSearchQuery, searchQueryNode } from "../../searchQuery.js";
import type { SearchPageProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds search-page";

/**
 * The search route's page: its title (the document's title too), how many
 * results match the text, and each result in rank order through the
 * site's chip switch over the passage that holds the text.
 *
 * `import { SearchPage } from "./lib/index.js";`
 *
 * @implements docs.component.search_page
 * @note Impure: reads `DocsSearchQuery` from the Relay store, fetching it
 *   when the store lacks it.
 */
export default function SearchPage({
  text,
  className,
  ...props
}: SearchPageProps): ReactElement {
  const t = useMessages();
  const { search } = useLazyLoadQuery<DocsSearchQuery>(
    searchQueryNode,
    buildSearchVariables(text),
  );
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
      <p className="summary">
        {search.total === 0
          ? t("search.none")
          : t("search.results", { count: search.total })}
      </p>
      {search.edges.length > 0 && (
        <ol className="results">
          {search.edges.map(({ cursor, node, match }) => (
            <li className="result" key={cursor}>
              <DocsChipProjection node={node} />
              <p className="passage">{match.passage}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
