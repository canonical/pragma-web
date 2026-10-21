import { ErrorBoundary } from "@canonical/prism-core";
import { Head } from "@canonical/react-head";
import { Link } from "@canonical/router-react";
import type { ReactElement } from "react";
import { Suspense } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import type { StandardEntityQuery } from "../../__generated__/StandardEntityQuery.graphql.js";
import standardEntityQueryNode from "../../__generated__/StandardEntityQuery.graphql.js";
import { Message, useMessages } from "../i18n/index.js";
import { StandardArticle } from "../StandardArticle/index.js";
import { buildStandardEntityVariables } from "../standardEntityQuery.js";
import type { StandardReadingPageProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `StandardEntityQuery`. `uri` and
 * `_meta.{curie,title,type}` ride at the root beside the masked fragment
 * spread: the page itself needs them for the head title, the not-found line
 * and the class guard, and fragment data is invisible to it by design.
 * Nothing calls it: the hook reads the compiled artifact, because an
 * evaluated tag throws at module scope wherever no Relay transform has run.
 *
 * `body` is the standard's prose, from the Prose extension: a provider that
 * serves it answers null for a standard with none, so the article falls back
 * to the description. Selecting it is what makes the lens Tier 2.
 *
 * `boundClass` IS LOAD-BEARING. `node(id:)` returns ANY node, so without a
 * guard `/standards/<a component IRI>` would render a standards page for a
 * component. The guard compares two absolute IRIs that the same server
 * produced, so no client-side prefix logic can drift.
 */
const declareStandardEntityQuery = (): unknown => graphql`
  query StandardEntityQuery($uri: ID!, $classUri: String!) {
    boundClass: ontologyClass(uri: $classUri) {
      uri
      subclasses {
        uri
      }
    }
    node(id: $uri) {
      uri
      _meta {
        curie
        title
        type {
          uri
        }
      }
      ...StandardArticle_standard
    }
    body: prose(uri: $uri) {
      ...StandardProse_body
    }
  }
`;
void declareStandardEntityQuery;
/* v8 ignore stop */

const componentCssClassName = "ds standard-reading";

/**
 * The data-bearing interior: one `useLazyLoadQuery` per page, the article
 * fragment fanning out below. A node that is absent, or that is not an
 * instance of the bound class, renders the in-canvas not-found alert: an
 * unknown address is a page with an honest alert, never an HTTP 404, because
 * the address space is the graph's, not the router's.
 *
 * ONE LEVEL of `subclasses` is admitted, matching what `instances` returns
 * on both known providers. A deeper hierarchy would need transitivity, which
 * the guard does not have.
 */
function ReadingContent({
  classUri,
  uri,
}: {
  readonly classUri: string;
  readonly uri: string;
}): ReactElement {
  const t = useMessages();
  const data = useLazyLoadQuery<StandardEntityQuery>(
    standardEntityQueryNode,
    buildStandardEntityVariables(classUri, uri),
  );
  const bound = data.boundClass;
  const permitted = new Set(
    bound === null || bound === undefined
      ? []
      : [bound.uri, ...bound.subclasses.map((subclass) => subclass.uri)],
  );
  const node = data.node;
  const standard = node && permitted.has(node._meta.type.uri) ? node : null;

  if (!standard) {
    return (
      <>
        <Head title={t("reading.missing.title")} />
        <p role="alert">
          <Message
            elements={{ uri: <code>{uri}</code> }}
            id="reading.missing"
          />
        </p>
      </>
    );
  }

  return (
    <>
      <Head title={standard._meta.title} />
      <StandardArticle body={data.body ?? null} standard={standard} />
    </>
  );
}

/**
 * The reading page (`/standards/:uri`, key `standardEntity`): the
 * standard's reading column under a breadcrumb back to the index. The
 * breadcrumb and the `data-view` marker live outside the suspending
 * interior, so route content never suspends at the outlet.
 *
 * `import { StandardReadingPage } from "./StandardReadingPage/index.js";`
 */
export default function StandardReadingPage({
  classUri,
  className,
  params,
  ...props
}: StandardReadingPageProps): ReactElement {
  const t = useMessages();
  const { uri } = params;

  return (
    <section
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-view="standard-reading"
    >
      <nav aria-label={t("reading.breadcrumb.label")} className="breadcrumb">
        <Link className="breadcrumb-link" to="standards">
          {t("reading.breadcrumb.index")}
        </Link>
      </nav>
      <ErrorBoundary
        fallback={<p role="alert">{t("page.error")}</p>}
        resetKey={uri}
      >
        <Suspense fallback={<p>{t("reading.loading")}</p>}>
          <ReadingContent classUri={classUri} uri={uri} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
