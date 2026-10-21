import { ErrorBoundary } from "@canonical/prism-core";
import { Head } from "@canonical/react-head";
import { type ReactElement, Suspense, useId } from "react";
import { graphql } from "react-relay";
import { useMessages } from "../i18n/index.js";
import { EntityIndex } from "./common/EntityIndex/index.js";
import type { EntityIndexPageProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `EntityIndexQuery`: the whole index is one
 * operation, the pagination fragment's first page riding the root. Nothing
 * calls it: `EntityIndex` reads the compiled artifact, because an evaluated
 * tag throws at module scope wherever no Relay transform has run.
 */
const declareEntityIndexQuery = (): unknown => graphql`
  query EntityIndexQuery($classUri: String!, $count: Int!, $cursor: String) {
    ...EntityIndex_query
      @arguments(classUri: $classUri, count: $count, cursor: $cursor)
  }
`;
void declareEntityIndexQuery;
/* v8 ignore stop */

const componentCssClassName = "ds entity-index-page";

/**
 * The lens's index route content (`/${id}`, the binding's own route name):
 * the bound class's instances, as rows or cards, filtered by the strip's
 * search.
 *
 * The heading names the lens in the site's own words (`label`) and stays
 * outside the boundaries, so it stands while the list suspends; the list
 * has its own error boundary and Suspense, so suspension never reaches the
 * router's outlet, which would swap the whole layout for the fallback.
 *
 * `import { EntityIndexPage } from "@canonical/prism-lens-entity";`
 */
export default function EntityIndexPage({
  binding,
  className,
  label,
  ...props
}: EntityIndexPageProps): ReactElement {
  const t = useMessages();
  const headingId = useId();
  return (
    <section
      {...props}
      aria-labelledby={headingId}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <Head title={label} />
      <h1 className="heading" id={headingId}>
        {label}
      </h1>
      <ErrorBoundary fallback={<p role="alert">{t("index.error")}</p>}>
        <Suspense fallback={<p className="loading">{t("index.loading")}</p>}>
          <EntityIndex binding={binding} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
