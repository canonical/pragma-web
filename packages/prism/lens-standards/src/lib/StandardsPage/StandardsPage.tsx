import { ErrorBoundary } from "@canonical/prism-core";
import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { Suspense } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import type { StandardsIndexQuery } from "../../__generated__/StandardsIndexQuery.graphql.js";
import standardsIndexQueryNode from "../../__generated__/StandardsIndexQuery.graphql.js";
import { useMessages } from "../i18n/index.js";
import { StandardsIndex } from "../StandardsIndex/index.js";
import { buildStandardsIndexVariables } from "../standardsIndexQuery.js";
import type { StandardsPageProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `StandardsIndexQuery`: the whole page is one
 * operation, the pagination fragment's first page riding the root query.
 * Nothing calls it: the hook reads the compiled artifact, because an
 * evaluated tag throws at module scope wherever no Relay transform has run.
 */
const declareStandardsIndexQuery = (): unknown => graphql`
  query StandardsIndexQuery($classUri: String!, $count: Int!, $cursor: String) {
    ...StandardsIndex_query
      @arguments(classUri: $classUri, count: $count, cursor: $cursor)
  }
`;
void declareStandardsIndexQuery;
/* v8 ignore stop */

const componentCssClassName = "ds standards-page";

/**
 * The data-bearing interior: one `useLazyLoadQuery` per page, with the
 * variables the route's `warm` prefetched, so a warm store fulfils it; the
 * pagination fragment fans out from the query root.
 */
function IndexContent({
  classUri,
}: {
  readonly classUri: string;
}): ReactElement {
  const data = useLazyLoadQuery<StandardsIndexQuery>(
    standardsIndexQueryNode,
    buildStandardsIndexVariables(classUri),
  );
  return <StandardsIndex query={data} />;
}

/**
 * The standards index (`/standards`, key `standards`): the bound class's
 * instances grouped by their own class, with jump links between the groups.
 * The heading stays outside the boundaries, so it stands while the interior
 * suspends, and route content never suspends at the outlet, which would swap
 * the whole layout for the fallback.
 *
 * `import { StandardsPage } from "./StandardsPage/index.js";`
 */
export default function StandardsPage({
  classUri,
  className,
  ...props
}: StandardsPageProps): ReactElement {
  const t = useMessages();
  return (
    <section
      {...props}
      aria-labelledby="lens-standards-title"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <Head title={t("page.title")} />
      <h1 className="heading" id="lens-standards-title">
        {t("lens.label")}
      </h1>
      <ErrorBoundary fallback={<p role="alert">{t("page.error")}</p>}>
        <Suspense fallback={<p>{t("index.loading")}</p>}>
          <IndexContent classUri={classUri} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
